interface IUpdateOne {
    acknowledged: boolean;
    modifiedCount: number;
    upsertedId: any;
    upsertedCount: number;
    matchedCount: number;
}

interface IDeleteOne {
    acknowledged: boolean;
    deletedCount: number;
}

export { IUpdateOne, IDeleteOne }