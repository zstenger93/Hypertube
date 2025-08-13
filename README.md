![EducationalPurpose](./educationalPurpose.png)
![Login](./login.png)
![Search](./search.png)

❌ Mandatory Part

- [✅] Create a web application with a user-friendly UI
- [✅] User registration with email and a protected password
- [❌] username, last name, first name, needs to be edited
- [✅] Omniauth login (42 strategy + another method)
- [✅] Login with username & password
- [✅] password reset via email
- [✅] Logout with one click from any page
- [❌] Select a preferred language (default: English)
- [❌] Modify profile details (email, profile picture, info)
- [❌] View other users' profiles (without email visibility)
- [❌] Implement a Library Section (authenticated users only)
- [✅] Search field querying at least two external video content sources
- [✅] Display search results as thumbnails, sorted by name
- [✅] If no search, display popular videos sorted by criteria (downloads, peers, seeders, etc.)
- [✅] Thumbnails must include:
- [✅] Video name
- [✅] Production year (if available)
- [✅] IMDb rating (if available)
- [✅] Cover image
- [❌] Differentiate watched & unwatched videos in thumbnails
- [❌] Implement infinite scrolling (no "next page" link)
- [✅] Sort & filter options (name, genre, IMDb rating, year, etc.)
- [✅] Implement a Video Section (authenticated users only)
- [❌] Video player (if available)
- [✅] Casting (producer, director, main cast, etc.)
- [✅] Production year, length, IMDb rating
- [✅] Cover image
- [✅] Users can post & view comments
- [✅] If not downloaded, start torrent download on the server
- [✅] Initiate streaming as soon as enough data is available
- [✅] Store downloaded movies to avoid re-downloading
- [❌] Delete movies if unwatched for one month
- [❌] Download English subtitles if available
- [❌] Auto-select subtitles if video language ≠ user’s preferred language
- [✅ ?? ❌] Convert videos on-the-fly if unsupported (at least mkv format) 
<!-- TODO  archive.org use mp4 always. there is no point for this check-->
- [✅] Develop a RESTful API with OAuth2 authentication
- [❌] Retrieve/update user profiles
- [✅] Access/post comments via /comments/:id and /movies/:id/comments
- [✅] View front page with top movies
- [✅] Fetch movie details via /movies/:id
- [✅] API must return appropriate HTTP codes for invalid calls
- [❌] Provide proof that the API is truly RESTful

  ❌ Bonus Part

- [✅] Additional Omniauth strategies
- [❌] Support for multiple video resolutions
- [❌] Stream video via the MediaStream API
- [✅] More API routes (add, delete movies, etc.)
