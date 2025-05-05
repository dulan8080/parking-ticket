import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  pin: z.string().length(4).regex(/^\d+$/, "PIN must be a 4-digit number").optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { name, email, password, pin } = validation.data;
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }
    
    // Check if PIN already exists (if provided)
    if (pin) {
      const existingPin = await prisma.user.findFirst({
        where: { pin },
      });
      
      if (existingPin) {
        return NextResponse.json(
          { error: "PIN already in use" },
          { status: 400 }
        );
      }
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Find the OPERATOR role
    const operatorRole = await prisma.role.findUnique({
      where: { name: "OPERATOR" },
    });
    
    if (!operatorRole) {
      return NextResponse.json(
        { error: "Failed to assign role to user" },
        { status: 500 }
      );
    }
    
    // Create user with OPERATOR role
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        pin,
        roles: {
          create: {
            roleId: operatorRole.id,
          },
        },
      },
    });
    
    return NextResponse.json(
      { 
        success: true,
        message: "User registered successfully",
        userId: user.id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { 
        error: "Registration failed",
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
} 