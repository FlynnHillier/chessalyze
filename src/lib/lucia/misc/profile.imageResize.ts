/**
 *
 * @param googleImageURL original google image url
 * @param size size of image url to return
 * @returns url of google image for desired size
 */
export function resizeGoogleProfilePictureURL(
  googleImageURL: string,
  size: number,
) {
  if (
    !new RegExp(
      "https://lh3.googleusercontent.com/a/[a-zA-Z0-9_-]*=s(\\d)+-c",
    ).test(googleImageURL)
  ) {
    if (window !== undefined)
      console.error(
        `failed to resize google image url '${googleImageURL}'. It did not pass the google image link regex`,
        { googleImageURL },
      );
    return googleImageURL;
  }

  return `${googleImageURL.split("=")[0]}=s${size}-c`;
}
