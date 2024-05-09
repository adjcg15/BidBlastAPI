import { DataContextException } from "@exceptions/services";
import { IAuctionCategory } from "@ts/data";
import AuctionCategory from "@models/AuctionCategory";
import { UniqueConstraintError } from 'sequelize';

class AuctionCategoryService{
    public static async getAuctionCategoryById(idAuctionCategory: number){
        let category: IAuctionCategory | null = null;

        try {
            const auctionCategory = await AuctionCategory.findOne({
                where: {
                    id_auction_category: idAuctionCategory
                }
            });

            if(auctionCategory != null){
                const auctionCategoryInformation = auctionCategory.toJSON();

                category = {
                    id: auctionCategoryInformation.id_auction_category,
                    title: auctionCategoryInformation.title,
                    description: auctionCategoryInformation.description,
                    keywords: auctionCategoryInformation.keywords
                };
            }
        } catch (error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";

            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to access to the information of the auction category. ${errorCodeMessage}`
            );
        }

        return category;
    }

    public static async updateAuctionCategory(idAuctionCategory: number, title: string, description: string, keywords: string){
        let isUpdated: boolean = false;
        
        try {
            await AuctionCategory.update(
                {
                    title, description, keywords
                }, {
                where: {
                    id_auction_category: idAuctionCategory
                }
            });

            isUpdated = true;
        } catch (error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";

            if (error instanceof UniqueConstraintError) {
                isUpdated = false;
            } else {
                throw new DataContextException(
                    error.message
                    ? `${error.message}. ${errorCodeMessage}`
                    : `It was not possible to update the information of the auction category. ${errorCodeMessage}`
                );
            }
        }

        return isUpdated;
    }
}

export default AuctionCategoryService;