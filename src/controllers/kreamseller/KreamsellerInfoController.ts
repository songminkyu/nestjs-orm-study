import core from "@nestia/core";
import { Controller, NotFoundException, Body } from "@nestjs/common";
import { ISeller } from "@ORGANIZATION/PROJECT-api/lib/structures/kreamseller/ISeller";
import { SellerProvider } from "../../providers/kreamseller/SellerProvider";
import { PrismaClient } from "@prisma/client";

@Controller("kream/sellerinfo")
export class KreamsellerInfoController {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    /**
     * Get performance information.
     *
     * Get perofmration information composed with CPU, memory and resource usage.
     *
     * @returns Performance info
     * @tag Monitor
     * @throws {NotFoundException} When seller data is not found
     *
     * @author Samchon
     */
    @core.TypedRoute.Get()
    public async get(): Promise<ISeller> {
        const sellerData = await this.prisma.seller.findFirst(SellerProvider.json.select());

        if (!sellerData) {
            throw new NotFoundException('Seller data not found');
        }

        return SellerProvider.json.transform(sellerData);
    }

    @core.TypedRoute.Post()
    public async post(@Body() data: ISeller): Promise<ISeller> {
        // Transform the input data using SellerProvider.collect
        const createData = SellerProvider.collect(data);

        // Insert the data into the database
        const createdSeller = await this.prisma.seller.create({
            data: createData
        });

        // Transform and return the created data
        return SellerProvider.json.transform(createdSeller);
    }
}