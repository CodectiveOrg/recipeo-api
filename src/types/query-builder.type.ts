import { SelectQueryBuilder } from "typeorm";
import { ObjectLiteral } from "typeorm/common/ObjectLiteral";

import { Recipe } from "@/entities/recipe";

export type Qb<Entity extends ObjectLiteral = Recipe> =
  SelectQueryBuilder<Entity>;
