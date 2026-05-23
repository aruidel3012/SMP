import User from "../models/User.ts";
import Subscription from "../models/Subscription.ts";
import { SUBSCRIPTION_PLANS } from "../config.js";

export async function assignLearningPlanToSeedUser(): Promise<void> {
  const targetEmail = "pcasmar0502@g.educaand.es";
  try {
    const user = await User.findOne({ email: targetEmail });
    const learningPlan = SUBSCRIPTION_PLANS.find((plan: { id: string }) => plan.id === "learning");

    if (!user || !learningPlan) return;

    const existing = await Subscription.findOne({
      clientId: user._id,
      planId: learningPlan.id,
      status: "active",
    });

    if (existing) return;

    await Subscription.create({
      clientId: user._id,
      clientEmail: user.email,
      planId: learningPlan.id,
      planName: learningPlan.name,
      planType: learningPlan.type,
      price: learningPlan.price,
      status: "active",
    });

    await User.findByIdAndUpdate(user._id, {
      subscriptionPlan: learningPlan.id,
      subscriptionStatus: "active",
      subscriptionStartDate: new Date(),
    });

    console.log(`Learning plan assigned to ${user.email}`);
  } catch (err) {
    console.error("Error assigning learning plan:", (err as Error).message);
  }
}
