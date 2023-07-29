import slug from 'slug';

export const slugUsername = (username) => slug(username, {replacement: "_", lower:false});
