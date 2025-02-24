import { Prisma, PrismaClient } from "@prisma/client";
import { NotFoundException, Injectable } from "@nestjs/common"
import { ISeller } from "@ORGANIZATION/PROJECT-api/lib/structures/kreamseller/ISeller";
export namespace SellerProvider {
    export namespace json {
        export const transform = (
            input: Prisma.sellerGetPayload<ReturnType<typeof select>>,
        ): ISeller => ({
            uid: input.uid,
            sales_co: input.sales_co,
            seller_name: input.seller_name,
            seles_item: input.seles_item,
            created_at: input.created_at.toISOString(),
        });
        export const select = () =>
            Prisma.validator<Prisma.sellerFindManyArgs>()({});
    }

    export const collect = (input: ISeller) =>
        Prisma.validator<Prisma.sellerCreateInput>()({
            uid: input.uid,
            sales_co: input.sales_co,
            seller_name: input.seller_name,
            seles_item: input.seles_item,
            created_at: new Date(),
        });
    export const update = (update:ISeller)=>
        Prisma.validator<Prisma.sellerUpdateInput>()({
            uid: update.uid,
            sales_co: update.sales_co,
            seller_name: update.seller_name,
            seles_item: update.seles_item,
            created_at: new Date(),
        });

}
@Injectable()
export class SellerService {
    private prisma: PrismaClient;
    constructor() {
        this.prisma = new PrismaClient()
    }

    async readSeller() {
        const sellerData = await this.prisma.seller.findFirst(
            SellerProvider.json.select()
        );

        if (!sellerData) {
            throw new NotFoundException('Seller data not found');
        }

        return SellerProvider.json.transform(sellerData);
    }
    async createSeller(data: ISeller){
        // Transform the input data using SellerProvider.collect
        const createData = SellerProvider.collect(data);

        // Insert the data into the database
        const createdSeller = await this.prisma.seller.create({
            data: createData
        });

        // Transform and return the created data
        return SellerProvider.json.transform(createdSeller);
    }
    async updateSeller(data: ISeller) {
        try {
            const updateData = SellerProvider.update(data);

            const updatedSeller = await this.prisma.seller.update({
                where: {
                    uid_sales_co: {  // 복합 unique constraint 사용
                        uid: data.uid,
                        sales_co: data.sales_co
                    }
                },
                data: updateData
            });

            return SellerProvider.json.transform(updatedSeller);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`Seller with uid ${data.uid} and sales_co ${data.sales_co} not found`);
            }
            throw error;
        }
    }
}
