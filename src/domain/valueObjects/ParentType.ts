export enum ParentType {
    SPECIAL_APPEAL = 'special_appeal',
    SKILL = 'skill',
    TRAIT = 'trait',
}

export type ParentTypeValue = (typeof ParentType)[keyof typeof ParentType];
