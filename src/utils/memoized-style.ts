import { memoize } from "lodash";
import { Falsy, RegisteredStyle } from "react-native";

type IStyle<T> = T | RegisteredStyle<T> | Falsy;

function memoizedStyle<T>(styles: Array< IStyle<T> >) {
    return styles;
}

function cacheKeyResolver<T>(styles: Array< IStyle<T> >) {
    return styles.join("_");
}

export default memoize(memoizedStyle, cacheKeyResolver);
