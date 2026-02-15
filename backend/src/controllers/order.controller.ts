import { Request, Response } from "express";
import Stripe from "stripe";
import { Resturant, TMenuItemType } from "../models/resturant.model";
import { Order } from "../models/order.model";

const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || "prod";
const STRIPE =
  PAYMENT_PROVIDER === "prod"
    ? new Stripe(process.env.STRIPE_API_KEY as string)
    : null;

const FRONTEND_URL = process.env.FRONTEND_URL;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

type TCheckoutSessionRequest = {
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: number;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    addressLine1: string;
    city: string;
  };
  resturantId: string;
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const checkoutSessionRequest: TCheckoutSessionRequest = req.body;
    const resturant = await Resturant.findById(
      checkoutSessionRequest.resturantId
    );
    if (!resturant) {
      return res.status(404).json("Resturant not found");
    }

    const newOrder = new Order({
      resturant: resturant,
      user: req.userId,
      status: "placed",
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      createdAt: new Date(),
    });
    const lineItem = createLineItems(
      checkoutSessionRequest,
      resturant.menuItems
    );

    // Handle mock mode for testing
    if (PAYMENT_PROVIDER === "mock") {
      newOrder.totalAmount = 5000;
      newOrder.status = "paid";
      await newOrder.save();
      return res.json({
        url: `${FRONTEND_URL}/order-status?success=true`,
        orderId: newOrder._id
      });
    }

    const session = await createSession(
      lineItem,
      newOrder._id.toString(),
      resturant.deliveryPrice,
      resturant._id.toString()
    );
    if (!session?.url) {
      return res.status(500).json("Error creating stripe session");
    }
    await newOrder.save();
    return res.json({ url: session.url });
  } catch (error: any) {
    console.log(error);
    res.status(500).json(error.raw.message);
  }
};

const createLineItems = (
  checkoutSessionRequest: TCheckoutSessionRequest,
  menuItems: TMenuItemType[]
) => {
  const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
    const menuItem = menuItems.find((item) => item.name == cartItem.name);
    if (!menuItem) {
      throw new Error(`Menuitem not found ${cartItem.menuItemId}`);
    }
    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "usd",
        unit_amount: menuItem.price,
        product_data: {
          name: menuItem.name,
        },
      },
      quantity: Number(cartItem.quantity),
    };
    return line_item;
  });
  return lineItems;
};

const createSession = async (
  lineItem: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryPrice: number,
  resturantId: string
) => {
  if (!STRIPE) {
    throw new Error("Stripe is not initialized");
  }
  const sessionData = await STRIPE?.checkout.sessions.create({
    line_items: lineItem,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery",
          type: "fixed_amount",
          fixed_amount: {
            amount: deliveryPrice,
            currency: "usd",
          },
        },
      },
    ],
    mode: "payment",
    metadata: {
      orderId,
      resturantId,
    },
    success_url: `${FRONTEND_URL}/order-status?success=true`,
    cancel_url: `${FRONTEND_URL}/detail/${resturantId}?cancelled=true`,
  });
  return sessionData;
};

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  let event;
  try {
    if (PAYMENT_PROVIDER === "mock") {
      return res.status(200).send("Webhook skipped in mock mode");
    }
    const sig = req.headers["stripe-signature"];
    if (!sig) {
      return res.status(400).send("Stripe signature is missing");
    }
    event = STRIPE?.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return res.status(400).send(`Webhook Error: ${error.message}`);
    } else {
      return res.status(400).send("An unknown error occurred.");
    }
  }
  if (event?.type == "checkout.session.completed") {
    const order = await Order.findById(event.data.object.metadata?.orderId);
    if (!order) {
      return res.status(404).json("order not found");
    }
    order.totalAmount = event.data.object.amount_total;
    order.status = "paid";
    await order.save();
  }
  res.status(200).send();
};

export const orderStatus = async (req: Request, res: Response) => {
  try {
    const orderStatus = await Order.find({ user: req.userId })
      .populate("resturant")
      .populate("user");
    res.status(200).json(orderStatus);
  } catch (error) {
    res.status(400).json(error);
  }
};
