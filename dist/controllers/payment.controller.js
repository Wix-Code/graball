import axios from "axios";
import prisma from "../config/prismaConnect.js";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
export const initializePayment = async (req, res) => {
    try {
        const { email, planType, userId } = req.body;
        const planAmounts = {
            monthly: 5000,
            "6months": 25000,
            yearly: 45000,
        };
        const amount = planAmounts[planType];
        if (!amount) {
            return res.status(400).json({ error: "Invalid plan type" });
        }
        // Create Paystack payment session
        const response = await axios.post("https://api.paystack.co/transaction/initialize", {
            email,
            amount: amount * 100, // kobo
            callback_url: `${process.env.CLIENT_URL}/payment/verify`,
            metadata: { userId, planType },
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        });
        const { authorization_url, reference } = response.data.data;
        // Save pending subscription
        await prisma.subscription.create({
            data: {
                userId,
                planType,
                amount,
                reference,
                status: "pending",
                endDate: new Date(), // temporary, will update after verify
            },
        });
        res.json({ authorization_url });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Payment initialization failed" });
    }
};
export const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.query;
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
        });
        const data = response.data.data;
        if (data.status !== "success") {
            return res.status(400).json({ error: "Payment not successful" });
        }
        const sub = await prisma.subscription.update({
            where: { reference: reference },
            data: {
                status: "active",
                startDate: new Date(),
                endDate: new Date(new Date().setMonth(new Date().getMonth() +
                    (data.metadata.planType === "6months" ? 6 :
                        data.metadata.planType === "yearly" ? 12 : 1))),
            },
        });
        res.json({ success: true, subscription: sub });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Verification failed" });
    }
};
//# sourceMappingURL=payment.controller.js.map