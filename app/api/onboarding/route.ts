import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import OnboardingProfile, {
  type ITenantAnswers,
  type IOwnerAnswers,
  type IAgentAnswers,
} from "@/models/OnboardingProfile";

const VALID_ROLES = ["tenant", "owner", "agent"] as const;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { role, answers } = body as {
      role: "tenant" | "owner" | "agent";
      answers: ITenantAnswers | IOwnerAnswers | IAgentAnswers;
    };

    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: "Invalid or missing role" },
        { status: 400 }
      );
    }

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Invalid or missing answers" },
        { status: 400 }
      );
    }

    await connectDB();

    const profile = await OnboardingProfile.findOneAndUpdate(
      { clerkUserId: userId },
      {
        clerkUserId: userId,
        role,
        answers,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Onboarding API error:", error);
    return NextResponse.json(
      { error: "Failed to save onboarding" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const profile = await OnboardingProfile.findOne({
      clerkUserId: userId,
    });

    return NextResponse.json(profile ?? null);
  } catch (error) {
    console.error("Onboarding GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding" },
      { status: 500 }
    );
  }
}
