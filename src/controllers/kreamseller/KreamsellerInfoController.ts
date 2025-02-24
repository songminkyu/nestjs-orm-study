import core from "@nestia/core";
import { Body, Controller } from "@nestjs/common";

import { ISeller } from "@ORGANIZATION/PROJECT-api/lib/structures/kreamseller/ISeller";

import { SellerService } from "../../providers/kreamseller/SellerProvider";

@Controller("kream/sellerinfo")
export class KreamsellerInfoController {
  private seller: SellerService;
  constructor() {
    this.seller = new SellerService();
  }

  @core.TypedRoute.Get()
  public async get(): Promise<ISeller> {
      return await this.seller.readSeller();
  }

  @core.TypedRoute.Post()
  public async post(@Body() data: ISeller): Promise<ISeller> {
      return await this.seller.createSeller(data)
  }
}