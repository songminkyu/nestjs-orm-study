import { Prisma } from "@prisma/client";
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
}
