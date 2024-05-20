import { Schema } from "express-validator";

class AuctionCategoriesRequestValidator {
    public static auctionCategorySchema(): Schema {
        return {
            catid: {
                in: ["params"],
                isInt: true,
                errorMessage: "Invalid category id"
            },
        };
    }

    public static auctionCategoryModificationSchema(): Schema {
        return {
            catid: {
                in: ["params"],
                isInt: true,
                errorMessage: "Invalid category id"
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