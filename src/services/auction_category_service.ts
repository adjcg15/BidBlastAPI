import { DataContextException } from "@exceptions/services";
import { IAuctionCategory } from "@ts/data";
import AuctionCategory from "@models/AuctionCategory";
import { UniqueConstraintError, literal } from 'sequelize';
import { CreateAuctionCategoryCodes, ModifyAuctionCategoryCodes } from "@ts/enums";

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

    public static async registerAuctionCategory(title: string, description: string, keywords: string){
        let resultCode: CreateAuctionCategoryCodes | null = null;
        
        try {
            const dbCategory = await AuctionCategory.findOne({
                where: {
                    title
                }
            }); 

            if (dbCategory !== null) {
                resultCode = CreateAuctionCategoryCodes.TITLE_ALREADY_EXISTS;
                return resultCode;
            }

            await AuctionCategory.create(
                {
                    title, description, keywords
                }
            );

        } catch (error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to register the information of the auction category. ${errorCodeMessage}`
            );
        }

        return resultCode;
    }

    public static async updateAuctionCategory(idAuctionCategory: number, title: string, description: string, keywords: string){
        let resultCode: ModifyAuctionCategoryCodes | null = null;
        
        try {
            const dbCategory = await AuctionCategory.findByPk(idAuctionCategory, {
                attributes: {
                    include: [
                        [
                            literal(`(
                                SELECT IF(COUNT(*) > 0, 1, 0)
                                FROM auction_categories
                                WHERE title = "${title}" AND id_auction_category != "${idAuctionCategory}"
                            )`),
                            "titleAlreadyExists"
                        ]
                    ]
                }
            });            

            if (dbCategory === null) {
                resultCode = ModifyAuctionCategoryCodes.CATEGORY_NOT_FOUND;
                return resultCode;
            }

            const { titleAlreadyExists } = dbCategory.toJSON();
            if (titleAlreadyExists) {
                resultCode = ModifyAuctionCategoryCodes.TITLE_ALREADY_EXISTS;
                return resultCode;
            }

            await AuctionCategory.update(
                {
                    title, description, keywords
                }, {
                where: {
                    id_auction_category: idAuctionCategory
                }
            });

        } catch (error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to update the information of the auction category. ${errorCodeMessage}`
            );
        }

        return resultCode;
    }

    public static async getManyAuctionCategories(): Promise<IAuctionCategory[]> {
        let auctionCategories: IAuctionCategory[] = [];

        try {
            const dbCategories = await AuctionCategory.findAll();
            const categoriesData = dbCategories.map(category => category.toJSON());

            categoriesData.forEach(category => {
                const { id_auction_category, title, description, keywords } = category;

                auctionCategories.push({
                    id: id_auction_category,
                    title,
                    description,
                    keywords
                });
            });
        } catch(error:any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to recover the auction categories. ${errorCodeMessage}`
            );
        }

        return auctionCategories;
    }
}

export default AuctionCategoryService;