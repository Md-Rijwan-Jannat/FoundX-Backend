/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { QueryBuilder } from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { TImageFiles } from '../../interfaces/image.interface';
import {
  addDocumentToIndex,
  deleteDocumentFromIndex,
} from '../../utils/meilisearch';
import { User } from '../User/user.model';
import { ItemsSearchableFields } from './item.constant';
import { TItem } from './item.interface';
import { Item } from './item.model';
import {
  SearchItemByCategoryQueryMaker,
  SearchItemByDateRangeQueryMaker,
  SearchItemByUserQueryMaker,
} from './item.utils';

const createItemIntoDB = async (payload: TItem, images: TImageFiles) => {
  const userIsExists = await User.findById(payload.user);

  if (!userIsExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const { itemImages } = images;
  payload.images = itemImages.map((image) => image.path);

  const result = await Item.create(payload);

  await addDocumentToIndex(result, 'items');

  return result;
};

const getAllMyPostsFromDB = async (
  query: Record<string, unknown>,
  user: any
) => {
  const isUserExists = await User.findOne({ email: user?.email });

  if (!isUserExists) {
    throw new Error('User not found');
  }

  query.user = isUserExists._id;

  const itemQuery = new QueryBuilder(
    Item.find({ user: isUserExists._id }).populate('user').populate('category'),
    query
  )
    .filter()
    .search(ItemsSearchableFields)
    .sort()
    .paginate()
    .fields();

  const result = await itemQuery.modelQuery;

  return result;
};

const getAllItemsFromDB = async (query: Record<string, unknown>) => {
  query = (await SearchItemByUserQueryMaker(query)) || query;

  // Date range search
  query = (await SearchItemByDateRangeQueryMaker(query)) || query;

  query = (await SearchItemByCategoryQueryMaker(query)) || query;

  const itemQuery = new QueryBuilder(
    Item.find().populate('user').populate('category'),
    query
  )
    .filter()
    .search(ItemsSearchableFields)
    .sort()
    // .paginate()
    .fields();

  const result = await itemQuery.modelQuery;

  return result;
};

const getItemFromDB = async (itemId: string) => {
  const result = await Item.findById(itemId)
    .populate('user')
    .populate('category');
  return result;
};

const updateItemInDB = async (itemId: string, payload: TItem) => {
  const result = await Item.findByIdAndUpdate(itemId, payload, { new: true });
  if (result) {
    await addDocumentToIndex(result, 'items');
  } else {
    throw new Error(`Item with ID ${itemId} not found.`);
  }
  return result;
};

const deleteItemFromDB = async (itemId: string) => {
  const result = await Item.findByIdAndDelete(itemId);
  const deletedItemId = result?._id;
  if (deletedItemId) {
    await deleteDocumentFromIndex('items', deletedItemId.toString());
  }
  return result;
};

export const ItemServices = {
  createItemIntoDB,
  getAllMyPostsFromDB,
  getAllItemsFromDB,
  getItemFromDB,
  updateItemInDB,
  deleteItemFromDB,
};
