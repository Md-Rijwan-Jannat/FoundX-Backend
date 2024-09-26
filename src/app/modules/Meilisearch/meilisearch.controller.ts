import { Request, Response } from 'express';

import httpStatus from 'http-status';

import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { MeilisearchServices } from './meilisearch.services';

const getItemsFromMeili = catchAsync(async (req: Request, res: Response) => {
  const { searchTerm } = req.query;

  const result = await MeilisearchServices.getAllItems(searchTerm as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Items Retrieved Successfully',
    data: result,
  });
});

export const MeiliSearchController = {
  getItemsFromMeili,
};
