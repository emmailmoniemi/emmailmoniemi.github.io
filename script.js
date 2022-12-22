    // create a function to generate snowflakes
    function generateSnowflakes() {
        // create a new snowflake element
        var snowflake = document.createElement("div");
        // add the snowflake class to the element
        snowflake.classList.add("snowflake");
        // add some content to the snowflake element
        snowflake.innerHTML = "❄️";
        // set a random left position for the snowflake
        snowflake.style.left = Math.random() * window.innerWidth + "px";
        // add the snowflake element to the body of the page
        document.body.appendChild(snowflake);
    }

    function getRandomIntBetweenMinusOneAndOne() {
        // generate a random number between 0 and 1
        var randomNumber = Math.random();
        // if the random number is less than 0.5, return -1
        if (randomNumber < 0.8) {
            return 0;
        }

        else if (randomNumber < 0.4) {
            return -1;
        }
        else {
            return 1;
        }
    }

    // create a function to animate the snowflakes
    function animateSnowflakes() {

        // get all the snowflake elements on the page
        var snowflakes = document.querySelectorAll(".snowflake");
        // loop through each snowflake element
        var i = 0
        snowflakes.forEach(function (snowflake) {
            // get the current top position of the snowflake

            var top = document.querySelectorAll(".snowflake")[i].offsetTop
            var left = document.querySelectorAll(".snowflake")[i].offsetLeft
            var rand = getRandomIntBetweenMinusOneAndOne();


            console.log(top)
            console.log(i)
            // set the new top position of the snowflake
            snowflake.style.top = top + 2 + "px";
            snowflake.style.left = left + rand + "px";

            // if the snowflake has reached the bottom of the screen, remove it
            if (top > window.innerHeight) {
                snowflake.remove();
            }
            i += 1
        });
    }

    // get the generate snowflakes button
    var generateSnowflakesButton = document.getElementById("generate-snowflakes-button");
    // attach an event listener to the button that calls the generateSnowflakes function when the button is clicked
    generateSnowflakesButton.addEventListener("click", generateSnowflakes);

