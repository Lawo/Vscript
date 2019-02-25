export declare type GenericTree<T> = {
    [key: string]: T | GenericTree<T>;
};
export declare type GenericDiff<S> = {
    only_in_old: S;
    only_in_new: S;
    modified: S;
    unmodified: S;
    [key: string]: S;
};
export declare type GenericTreeDiff<T> = GenericDiff<GenericTree<T>>;
export declare function tree_diff<T>(a: GenericTree<T>, b: GenericTree<T>, pars: {
    is_leaf: ((node: T | GenericTree<T>, /* top to bottom */ path: string[]) => boolean);
    equal?: ((leaf_a: T, leaf_b: T, /* top to bottom */ path: string[]) => boolean);
}): GenericTreeDiff<T>;
