"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestChannelName = void 0;
const unique_names_generator_1 = require("unique-names-generator");
const suggestChannelName = () => {
    return (0, unique_names_generator_1.uniqueNamesGenerator)({
        dictionaries: [unique_names_generator_1.adjectives, unique_names_generator_1.colors, unique_names_generator_1.animals],
        separator: " ",
        style: "capital",
    });
};
exports.suggestChannelName = suggestChannelName;
