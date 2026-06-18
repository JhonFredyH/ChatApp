import bcrypt  from "bcryptjs";
import jwt     from "jsonwebtoken";
import { z }   from "zod";
import prisma  from "../lib/prisma.js";

const registerSchema = z.object({
  name:     z.string().min(2, "Nombre muy corto").max(50).trim(),
  email:    z.string().email("Correo inválido").toLowerCase().trim(),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

const loginSchema = z.object({
  email:    z.string().email("Correo inválido").toLowerCase().trim(),
  password: z.string().min(1, "La contraseña es requerida"),
});

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors:  parsed.error.flatten().fieldErrors,
      });
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data:   { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true },
    });

    const { accessToken, refreshToken } = generateTokens(user.id);

    await prisma.refreshToken.create({
      data: {
        token:     refreshToken,
        userId:    user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    setRefreshCookie(res, refreshToken);
    return res.status(201).json({ user, accessToken });

  } catch (err) {
    console.error("[register]", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const login = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors:  parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data:  { isOnline: true, lastSeen: new Date() },
    });

    const { accessToken, refreshToken } = generateTokens(user.id);

    await prisma.refreshToken.create({
      data: {
        token:     refreshToken,
        userId:    user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    setRefreshCookie(res, refreshToken);
    return res.status(200).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
    });

  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await prisma.user.update({
        where: { id: decoded.userId },
        data:  { isOnline: false, lastSeen: new Date() },
      });
    }
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Sesión cerrada" });
  } catch {
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Sesión cerrada" });
  }
};