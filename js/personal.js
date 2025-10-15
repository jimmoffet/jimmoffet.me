/* ----------------------- 
    GLOBALS 
-------------------------*/
var sections = [
  { sentence: " a technology leader based in Portland" },
  { sentence: " helping the public use tech so it doesn't use us" },
  { sentence: " cofounder at Digital Public Ventures" },
  { sentence: " listening to Tikiyaki Orchestra on vinyl" },
  { sentence: " designing fault tolerant architecture" },
  { sentence: " finally updating his website" },
  { sentence: " validating new product ideas" },
  { sentence: " writing some code, just for fun" },
  { sentence: " eating Dimo's pizza and thinking about AI governance" },
  { sentence: " doing another usability test" },
  { sentence: " always giving a shit" },
  { sentence: " not so secretly in love with Carley Baer" },
  { sentence: " thinking about what to write next" },
  { sentence: " figuring out what A1 can and can't do" },
  { sentence: " fighting for attention" },
  { sentence: " filling sketchbooks with ideas" },
  { sentence: " squashing bugs" },
  { sentence: " consulting on top secret side projects" },
  { sentence: " dreaming of the Tatoosh Wilderness" },
  { sentence: " enjoying fall in Portland" },
  { sentence: " drinking a cocktail at Hale Pele" },
  { sentence: " reading The Entrepreneurial State by Mariana Mazzucato" },
  { sentence: " a heavy sleeper" },
  { sentence: " always learning from his teammates" },
  { sentence: " missing family every now and then" },
  { sentence: " buying another book" },
  { sentence: " fixing the letter-spacing of this title" },
  { sentence: " trying to make you laugh" },
  { sentence: " trusting his gut" },
  { sentence: " trying to write another policy memo" },
  { sentence: " not sure if this is going too far" },
  { sentence: " trying to be a better neighbor" },
  { sentence: " curious to know you" },
  { sentence: " always willing to chat with a new founder" },
  { sentence: " sending a short poem about science to his coffee roaster" },
  { sentence: " snoozing another reminder" },
  { sentence: " still trying to learn advanced math" },
  { sentence: " losing all of his spanish... mierda!" },
  { sentence: " looking forward to his next backpacking trip" },
];
var i = 0;
var j = 0;
var k = 0;
var lengthSentence = 0;
var lengthArray = sections.length;
var forward = true;
var beginning = "Jim Moffet is";
var currentPart = "";
var interval = 50;
var opening = false;

/* ----------------------- 
    TYPING 
-------------------------*/
function writing(text) {
  lengthSentence = sections[i].sentence.length;
  var body = $("body");
  if (!opening) {
    // first part
    setTimeout(function () {
      if (k < beginning.length) {
        if (beginning[k] === "<") {
          console.log("trovato il br");
          currentPart += ' <br id="brName">';
          k = k + 4;
        }
        currentPart += beginning[k];
        text.html(currentPart);
        k++;
        writing(text);
      } else if (k === beginning.length) {
        currentPart += " <br>";
        text.html(currentPart);
        opening = true;
        writing(text);
      }
    }, interval);
  } else if (opening) {
    // sentences
    setTimeout(function () {
      interval = 50;
      if (j === lengthSentence) {
        forward = false;
      }
      if (j === lengthSentence - 2) {
        $(".afterTyping").one().addClass("onScreen");
      }
      if (j === lengthSentence - 1 && forward) {
        interval = 2000;
      }
      if (j < lengthSentence && forward) {
        if (sections[i].sentence[j] === "&") {
          currentPart += "<strong>";
        } else if (sections[i].sentence[j] === "%") {
          currentPart += "</strong>";
        } else {
          currentPart += sections[i].sentence[j];
        }
        text.html(currentPart);
        j++;
      } else if (j > 0 && !forward) {
        if (sections[i].sentence[j] === "&") {
          currentPart = currentPart.slice(0, -8);
        } else if (sections[i].sentence[j] === "%") {
          currentPart = currentPart.slice(0, -9);
        } else {
          currentPart = currentPart.slice(0, -1);
        }
        text.html(currentPart);
        j--;
      } else if (j === 0) {
        forward = true;
        /*body.css({
					"background" : sections[i].background});*/
        i++; // loop fra sezioni
      }
      if (i === lengthArray) {
        i = 0;
      }
      writing(text);
    }, interval);
  }
}

/* ----------------------- 
    BACKGROUND LOOP 
-------------------------*/
function rand(min, max) {
  return min + Math.random() * (max - min);
}
function changebackground() {
  var body = $("body");
  var h = rand(1, 360); // 1, 360
  var s = rand(70, 80); // 80, 90
  var l = rand(20, 30); // 50, 60
  var h2;
  var l2 = l + 40;
  if (h < 180) {
    h2 = h + 180;
  } else {
    h2 = h - 180;
  }
  body.css({
    // looping background
    background: "hsl(" + h + "," + s + "%," + l + "%)",
  });
  $(".fixedBg").css({
    // background on hover
    background: "hsl(" + h + "," + s + "%," + l + "%)",
    color: "hsl(" + h2 + "," + s + "%," + l2 + "%)",
  });
  // TODO: dynamically set css token like so:
  // document.documentElement.style.setProperty('--primary-color', primaryColor);
  $(".infoImgBackground").css({
    // background on hover
    color: "hsl(" + h2 + "," + s + "%," + l2 + "%)",
    borderColor: "hsl(" + h2 + "," + s + "%," + l2 + "%)",
    backgroundColor: "hsl(" + h2 + "," + s + "%," + l2 + "%)",
  });
  console.log("background: hsl(" + h + "," + s + "%," + l + "%)");
  console.log("borderColor: hsl(" + h2 + "," + s + "%," + l2 + "%)");
  /*$(".loopCol").css({
    	"background" : "hsl(" + h + "," + s + "%,"+ l + "%)"
    });*/
  $(".coloredHover").css({
    // color links on hover
    color: "hsl(" + h + "," + s + "%," + l + "%)",
  });
}

/* ----------------------- 
    COLORS LOOP - OLD // LINKS COLOR
-------------------------*/
function loopColors() {
  var selector = $(".loopCol");
  var h = rand(1, 360);
  var s = rand(0, 100);
  var l = rand(0, 80);
  selector.css({
    color: "hsl(" + h + "," + s + "%," + l + "%)",
  });
}

/* ----------------------- 
    PARTICLES SETTINGS 
-------------------------*/
/*function particles(){
	particlesJS('particles-js', {
	  particles: {
	    color: '#fff',
	    color_random: false,
	    shape: 'triangle', // "circle", "edge" or "triangle"
	    opacity: {
	      opacity: 0.8,
	      anim: {
	        enable: true,
	        speed: 1,
	        opacity_min: 0,
	        sync: false
	      }
	    },
	    size: 4,
	    size_random: true,
	    nb: 80,
	    line_linked: {
	      enable_auto: true,
	      distance: 60,
	      color: '#fff',
	      opacity: 1,
	      width: 1,
	      condensed_mode: {
	        enable: false,
	        rotateX: 600,
	        rotateY: 600
	      }
	    },
	    anim: {
	      enable: true,
	      speed: 1
	    }
	  },
	  interactivity: {
	    enable: true,
	    mouse: {
	      distance: 300
	    },
	    detect_on: 'canvas', // "canvas" or "window"
	    mode: 'grab', // "grab" of false
	    line_linked: {
	      opacity: .5
	    },
	    events: {
	      onclick: {
	        enable: false,
	        mode: 'push', // "push" or "remove"
	        nb: 4
	      },
	      onresize: {
	        enable: true,
	        mode: 'bounce', // "out" or "bounce"
	        density_auto: true,
	        density_area: 1000 // nb_particles = particles.nb * (canvas width *  canvas height / 1000) / density_area
	      }
	    }
	  },
	  /* Retina Display Support 
	  retina_detect: true
	});
}*/

/* ----------------------- 
    NOOB SHIT 
-------------------------*/

$(document).ready(function () {
  /*--------------------
		BACKGROUND STUFF
	----------------------*/
  changebackground();
  setTimeout(function () {
    $("body").removeClass("noTransition");
    $("fixedBg").removeClass("noTransition");
    changebackground();
  }, 2000);
  setInterval(function () {
    changebackground();
  }, 20000);

  /*--------------------
		LOOPING COLORS
	----------------------*/
  /*loopColors();
	setTimeout(function(){ // hack change bg since the beginning
		loopColors();
	}, 2000)   
	setInterval(function(){
		loopColors();
	}, 10000);*/

  /*--------------------
		PARTICLES 
	----------------------*/
  //particles();

  /*--------------------
		TYPING 
	----------------------*/
  var firstTimer = 3000;
  var text = $(".jstext");
  setTimeout(function () {
    writing(text);
    //incipit(text);
  }, firstTimer);
  /*setTimeout(function(){
	}, secondTimer);*/

  /*--------------------
		HOVER 
	----------------------*/
  if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
    $("body").addClass("firefoxFix");
  }
  // var linkHover;
  // var isMobile = {
  //   Android: function () {
  //     return navigator.userAgent.match(/Android/i);
  //   },
  //   BlackBerry: function () {
  //     return navigator.userAgent.match(/BlackBerry/i);
  //   },
  //   iOS: function () {
  //     return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  //   },
  //   Opera: function () {
  //     return navigator.userAgent.match(/Opera Mini/i);
  //   },
  //   Windows: function () {
  //     return navigator.userAgent.match(/IEMobile/i);
  //   },
  //   any: function () {
  //     return (
  //       isMobile.Android() ||
  //       isMobile.BlackBerry() ||
  //       isMobile.iOS() ||
  //       isMobile.Opera() ||
  //       isMobile.Windows()
  //     );
  //   },
  // };
  // $(".loopCol").hover(function () {
  //   if (!isMobile.any()) {
  //     linkHover = $(this).attr("data-hover");
  //     $(this).toggleClass("spanActive");
  //     $("[data-background='" + linkHover + "']").toggleClass("bgActive");
  //   }
  // });
});

/*--------------------
HAVING FUN WITH TWEENMAX 
----------------------*/
//   $(document).ready(function ($) {
//     var bgFixed = $(".fixedBg");
//     var elements = $(".fixedBg span");
//     var triggerHover = $(".loopCol");
//     tlHoverIn = new TimelineMax();
//     tlHoverOut = new TimelineMax();

//     triggerHover.hover(
//       function () {
//         // Get the data-hover attribute and find matching fixedBg
//         var hoverTarget = $(this).attr("data-hover");
//         var targetBg = $("[data-background='" + hoverTarget + "']");

//         // Add spanActive class for the link color change
//         $(this).find(".coloredHover").addClass("spanActive");

//         tlHoverIn
//           .to(targetBg, 0.5, { autoAlpha: 1 })
//           .to(
//             targetBg.find("span:nth-of-type(1)"),
//             0.8,
//             { y: 0, ease: Expo.easeOut },
//             "0"
//           )
//           .to(
//             targetBg.find("span:nth-of-type(2)"),
//             0.8,
//             { y: 0, ease: Expo.easeOut },
//             "0.02"
//           )
//           .to(
//             targetBg.find("span:nth-of-type(3)"),
//             0.8,
//             { y: 0, ease: Expo.easeOut },
//             "0.04"
//           )
//           .to(
//             targetBg.find("span:nth-of-type(4)"),
//             0.8,
//             { y: 0, ease: Expo.easeOut },
//             "0.06"
//           );
//       },
//       function () {
//         // Get the data-hover attribute and find matching fixedBg
//         var hoverTarget = $(this).attr("data-hover");
//         var targetBg = $("[data-background='" + hoverTarget + "']");

//         // Remove spanActive class
//         $(this).find(".coloredHover").removeClass("spanActive");

//         tlHoverOut
//           .to(targetBg, 0.5, { autoAlpha: 0 })
//           .to(
//             targetBg.find("span:nth-of-type(1)"),
//             0.8,
//             { y: "20%", ease: Expo.easeOut },
//             "0"
//           )
//           .to(
//             targetBg.find("span:nth-of-type(2)"),
//             0.8,
//             { y: "40%", ease: Expo.easeOut },
//             "0.02"
//           )
//           .to(
//             targetBg.find("span:nth-of-type(3)"),
//             0.8,
//             { y: "60%", ease: Expo.easeOut },
//             "0.04"
//           )
//           .to(
//             targetBg.find("span:nth-of-type(4)"),
//             0.8,
//             { y: "80%", ease: Expo.easeOut },
//             "0.06"
//           );
//       }
//     );
//   });
