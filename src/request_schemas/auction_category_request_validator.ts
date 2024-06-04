import { Schema } from "express-validator";

class AuctionCategoriesRequestValidator {
    public static auctionCategorySchema(): Schema {
        return {
            catid: {
                in: ["params"],
                isInt: {
                    options: { min: 1 },
                    errorMessage: "Invalid category ID"
                },
                toInt: true
            },
        };
    }

    public static auctionCategoryModificationSchema(): Schema {
        return {
            catid: {
                in: ["params"],
                isInt: {
                    options: { min: 1 },
                    errorMessage: "Invalid category ID"
                },
                toInt: true
            },
            title: {
                in: ["body"],
                trim: true,
                notEmpty: true,
                errorMessage: "Title is required"
            },
            description: {
                in: ["body"],
                trim: true,
                notEmpty: true,
                errorMessage: "Description is required"
            },
            keywords:{
                in: ["body"],
                trim: true,
                notEmpty: true,
                errorMessage: "Keywords is required"
            }
        };
    }

    public static auctionCategoryRegistrartionSchema(): Schema {
        return {
            title: {
                in: ["body"],
                trim: true,
                notEmpty: true,
                errorMessage: "Title is required"
            },
            description: {
                in: ["body"],
                trim: true,
                notEmpty: true,
                errorMessage: "Description is required"
            },
            keywords:{
                in: ["body"],
                trim: true,
                notEmpty: true,
                errorMessage: "Keywords is required"
            }
        };
    }
}

export default AuctionCategoriesRequestValidator;