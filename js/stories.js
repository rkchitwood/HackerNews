"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  const showStar = Boolean(currentUser);
  // const showDeleteBtn = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
        ${showDeleteBtn ? getDeleteBtnHTML() : ""}
        ${showStar ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function getDeleteBtnHTML(){
  return `
      <span class="trash-can">
        <i class="fas fa-trash-alt"></i>
      </span>`
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function addNewStory(evt){
  console.debug("addNewStory");
  evt.preventDefault();
 
  const title = $("#submit-title").val();
  const author = $("#submit-author").val();
  const url = $("#submit-url").val();

  const newStory = await storyList.addStory(currentUser, {title, author, url});
  const $newStory = generateStoryMarkup(newStory);
  $allStoriesList.prepend($newStory);

  hidePageComponents();
  $submitForm.trigger("reset");
  $submitForm.slideUp("fast");
  putStoriesOnPage();

}
$submitForm.on("submit", addNewStory);

function getStarHTML(story, user){
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>`;
}




async function toggleStoryFavorite(evt){
  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);
  if ($tgt.hasClass("fas")){
    $tgt.closest("i").toggleClass("fas far");
    await currentUser.removeFavorite(story);
  }else{
    $tgt.closest("i").toggleClass("fas far");
    await currentUser.addFavorite(story);
    }
    saveFavorites();
}
$storiesLists.on("click", ".star", toggleStoryFavorite);

function showFavorites(){
  hidePageComponents();
  $favoritesList.empty();
  for(let favorite of currentUser.favorites){
    const $favorite = generateStoryMarkup(favorite);
    $favoritesList.append($favorite);
  }
  $favoritesList.show();
}
$navFavorites.on("click", showFavorites);

async function deleteStoryUI(evt){
  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");
  await storyList.deleteStory(currentUser, storyId);
  hidePageComponents()
  await getAndShowStoriesOnStart();
  
  
}
$storiesLists.on("click", ".trash-can", deleteStoryUI);

function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    // loop through all of users stories and generate HTML for them
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }

  $ownStories.show();
}