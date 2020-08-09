import { Response } from 'express';
import { validationResult } from 'express-validator';
import { BAD_REQUEST, OK, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { IRequest } from '../models/middleware.models';
import pool from '../database/poolConnection';

export async function LikeToPost(req: IRequest, res: Response): Promise<Response> {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(BAD_REQUEST).json({
            error: errors.array(),
            statusCode: BAD_REQUEST,
            data: null,
            message: 'WRONG DATA SCHEMA'
        });
    }
    const { postID } = req.params;
    const userID = req.user?.id;
    const { postLikes } = req.body;

    let postLikesParsed = Number.parseInt(postLikes);
    postLikesParsed++;
    
    const newLike = {
        userID,
        postID
    }

    try {

        await pool.query("INSERT INTO Likes SET ?", [newLike]); 
        await pool.query("UPDATE Posts SET likes = ? WHERE ID = ?", [postLikesParsed, postID]);

        return res.status(OK).json({
            error: false,
            statusCode: OK,
            data: null,
            message: 'Like saved'
        });

    } catch (err) {
        return res.status(INTERNAL_SERVER_ERROR).json({
            error: err,
            statusCode: INTERNAL_SERVER_ERROR,
            data: null,
            message: 'INTERNAL SERVER ERROR'
        });
    }
}

export async function LikeToAComment(req: IRequest, res: Response) {

    const { commentID } = req.params
    const userID = req.user?.id;
    const { commentLikes } = req.body;

    let commentsLikesParsed = Number.parseInt(commentLikes);
    commentsLikesParsed++;

    try {
        await pool.query("INSERT INTO CommentLikes SET ?", [ { userID, commentID } ]);

        await pool.query("UPDATE Comments SET likes = ? WHERE ID = ?", [ commentsLikesParsed, commentID ]);

        return res.status(OK).json({
            error: false,
            statusCode: OK,
            data: null,
            message: 'OK'
        });

    } catch (err) {
        return res.status(INTERNAL_SERVER_ERROR).json({
            error: err,
            statusCode: INTERNAL_SERVER_ERROR,
            data: null,
            message: 'INTERNAL SERVER ERROR'
        });
    }
}