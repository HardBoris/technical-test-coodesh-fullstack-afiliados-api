import { Request } from "express";
import {
  movementRepository,
  productRepository,
  userRepository,
} from "../repositories";
import { Movement, Product, User } from "../entities";
import { movementShape } from "../shapes";

class MovementService {
  user = async ({ body }: Request) =>
    await userRepository.findOne({ name: body.seller });
  product = async ({ body }: Request) =>
    await productRepository.findOne({ product: body.product });
  movementCreator = async (req: Request): Promise<any> => {
    const body = req.body;

    const user: User = await this.user(req);
    !user && (await userRepository.save({ name: body.seller }));

    const product: Product = await this.product(req);
    if (!product && body.type === "1") {
      await productRepository.save({
        product: body.product,
        producer: body.seller,
      });
    }
    if (product && body.type === "1") {
      await productRepository.save({
        product: body.product,
        producer: body.seller,
      });
    }
    if (!product && body.type !== "1") {
      await productRepository.save({ product: body.product });
    }

    const movement: Movement = await movementRepository.save({
      ...body,
      date: new Date(body.date),
    });

    return movement;
  };

  movementsLoader = async (req: Request) => {
    const movements: Movement[] = await movementRepository.all();

    return {
      status: 200,
      movements: await movementShape.movement.validate(movements, {
        stripUnknown: true,
      }),
    };
  };

  movementLoader = async (req: Request) => {
    const movement: Movement = await movementRepository.findOne({
      id: req.params.id,
    });
    return {
      status: 200,
      movement: movement,
    };
  };

  movementsByUser = async (req: Request) => {
    const movements: Movement[] = await movementRepository.allByUser({
      seller: { name: req.params.user },
    });

    return {
      status: 200,
      movements: await movementShape.movementByUser.validate(movements, {
        stripUnknown: true,
      }),
    };
  };

  movementsByProduct = async (req: Request) => {
    const movements: Movement[] = await movementRepository.allByProduct({
      product: req.params.product,
    });

    return {
      status: 200,
      movements: await movementShape.movementByProduct.validate(movements, {
        stripUnknown: true,
      }),
    };
  };
}

export default new MovementService();
