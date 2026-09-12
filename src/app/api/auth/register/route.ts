import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, validateIndianMobile, validatePasswordPolicy } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { setCustomerSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    // Anti-Spam / Anti-Bot Registration Rate Limiting (Max 6 accounts per minute per IP)
    const rateCheck = checkRateLimit(`register_${ip}`, { limit: 6, windowSeconds: 60 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: `Registration limit reached. Please wait ${rateCheck.resetSeconds} seconds before trying again.` },
        { status: 429 }
      );
    }

    const { name, email, phone, password } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Please provide Full Name, Email, Mobile Number, and Password." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Strict Indian Mobile Validation (exactly 10 digits starting with 6-9)
    const phoneValidation = validateIndianMobile(phone);
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { error: phoneValidation.error || "Invalid mobile number. Please provide a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }
    const cleanPhone = phoneValidation.normalized;

    // 2. Strict Password Policy Validation (Standard & Strong requirements)
    const pwdValidation = validatePasswordPolicy(password, {
      name,
      email: cleanEmail,
      phone: cleanPhone,
    });

    if (!pwdValidation.isValid) {
      return NextResponse.json(
        {
          error: pwdValidation.errors[0] || "Password does not meet security requirements.",
          details: pwdValidation.errors,
          checks: pwdValidation.checks,
        },
        { status: 400 }
      );
    }

    // Check duplicate by email
    const existingEmailUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmailUser) {
      return NextResponse.json(
        { error: `An account with email (${cleanEmail}) already exists. Please sign in.` },
        { status: 409 }
      );
    }

    // Check duplicate by phone
    const existingPhoneUser = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });
    if (existingPhoneUser) {
      return NextResponse.json(
        { error: `An account with mobile number (${cleanPhone}) already exists. Please sign in.` },
        { status: 409 }
      );
    }

    // Create user with secure bcrypt hash
    let newUser;
    const userData = {
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: hashPassword(password),
      isVerified: true,
    };

    try {
      newUser = await prisma.user.create({ data: userData });
    } catch (dbErr: any) {
      if (dbErr?.message?.includes("does not exist") || dbErr?.message?.includes("Unknown argument") || dbErr?.code === "P2021") {
        const { ensureUserTable } = await import("@/lib/db-tables");
        await ensureUserTable();
        // Fallback create without isVerified if legacy schema
        newUser = await prisma.user.create({
          data: {
            name: name.trim(),
            email: cleanEmail,
            phone: cleanPhone,
            password: hashPassword(password),
          },
        });
      } else {
        throw dbErr;
      }
    }

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      isVerified: (newUser as any).isVerified ?? true,
      avatarUrl: (newUser as any).avatarUrl,
      address: newUser.address,
      city: newUser.city,
      pincode: newUser.pincode,
    };

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully!",
      user: safeUser,
    });

    // Attach signed HttpOnly customer session cookie
    await setCustomerSessionCookie(response, {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    return response;
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
