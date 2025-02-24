import core from "@nestia/core";
import { Body, Controller, BadRequestException } from "@nestjs/common";

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

  @core.TypedRoute.Put(":uid/:sales_co")
  public async put(
      @core.TypedParam("uid") uid: string,
      @core.TypedParam("sales_co") sales_co: string,
      @Body() data: ISeller
  ): Promise<ISeller> {
    // uid와 sales_co가 일치하는지 확인
    if (data.uid !== uid || data.sales_co !== sales_co) {
      throw new BadRequestException("Path parameters do not match body data");
    }
    return await this.seller.updateSeller(data);
  }

}