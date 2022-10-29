var app = angular.module('app', []);
var api = 'http://localhost:8080';

app.controller('BigFiveController', function($scope, $http, $window) {

  $http({
    method: 'GET',
    url: api + '/bigFiveQuestions'
  }).then(function(response) {
    $scope.questions = response.data;
    document.getElementById('userId').value = $window.sessionStorage.getItem('userId');
  }, function(error) {
    console.log("Error occured when loading the big five questions");
  });

});

app.controller('HomeController', function($scope, $http, $window, $timeout) {
  $scope.user = {};
  $scope.user.questionSet = "1"; // This will be hardcoded based on the question set

  $scope.display = function() {
    $window.sessionStorage.setItem('consentTime', Date.now());
    $(".landing-page").css("display", "none");
    $("#demographics").css("display", "block");
  };

  $('.gender-radio-button').change(function() {
    if (this.id == "gender-specified") {
      $('#gender-text').prop('disabled', false);
      $('#gender-text').prop('required', true);
    } else {
      $('#gender-text').prop('required', false);
      $('#gender-text').val("");
      $('#gender-text').prop('disabled', true);
    }
  });

  $('.edu-radio-button').change(function() {
    if (this.id == "education-specified") {
      $('#education-text').prop('disabled', false);
      $('#education-text').prop('required', true);
    } else {
      $('#education-text').prop('required', false);
      $('#education-text').val("");
      $('#education-text').prop('disabled', true);
    }
  });

  $scope.indexNext = function(user) {
    if (user.gender && user.age && user.age >= 18 && user.education && user.socialmedia && (user.gender == "gender-specified" ? user.genderSpecified : true) && (user.education == "education-specified" ? user.educationSpecified : true)) {

      $("#index-next").attr('disabled', true);
      $(".input-text").attr('disabled', true);
      $(".specify-text").attr('disabled', true);
      $(".edu-specify-text").attr('disabled', true);

      $(".radio-button").attr('disabled', true);
      $(".gender-radio-button").attr('disabled', true);
      $(".edu-radio-button").attr('disabled', true);

      $("#index-next").css('background-color', 'grey');

      $("#demographics").css("display", "none");
      $("#index-instructions").css("display", "block");
      $("#index-submit-button").attr('disabled', true);

      $timeout(function() {
        $("#index-submit-button").css("background-color", "#117A65");
        $("#index-submit-button").attr('disabled', false);
      }, 10000);
    }
  };

  $scope.submitDetails = function(user) {
    $("#index-submit-button").attr('disabled', true);
    $("#index-loader").css("display", "block");

    //Set up the user object
    if (user.gender != "gender-specified") {
      delete user.genderSpecified;
    }
    if (user.education != "education-specified") {
      delete user.educationSpecified;
    }

    $http({
      method: 'POST',
      url: api + '/user',
      data: user,
      type: JSON,
    }).then(function(response) {
      $window.sessionStorage.setItem('userId', response.data.id);
      $window.sessionStorage.setItem('questionSet', user.questionSet);
      $window.sessionStorage.setItem('order', JSON.stringify(response.data.order));
      $window.location.href = './quiz.html';
    }, function(error) {
      console.log("Error occured when submitting user details");
    });

  };

});

app.controller('QuizController', function($scope, $http, $window, $timeout) {

  $scope.currentQIndex = 0;

  $scope.userId = $window.sessionStorage.getItem('userId');
  $scope.questionSet = $window.sessionStorage.getItem('questionSet');
  $scope.order = JSON.parse($window.sessionStorage.getItem('order'));

  $scope.question = {};

  $scope.initialFamiliarityChanged = false;
  $scope.initialOpinionChanged = false;
  $scope.initialConfChanged = false;

  $scope.sliderInitLikeChanged = false;
  $scope.sliderInitCommChanged = false;
  $scope.sliderInitShareChanged = false;
  $scope.sliderInitReportChanged = false;
  $scope.sliderInitFactChanged = false;

  $scope.onbeforeunloadEnabled = true;
  $scope.question = {};

  $(".slider-familiarity").change(function() {
    $scope.initialFamiliarityChanged = true;
    $("#outputFamiliarity").css("color", "green");
    $(".question-radio-opinion").css("display", "block");
  });

  $(".slider-old-opinion").change(function() {
    $scope.initialOpinionChanged = true;
    $("#outputInitialOpinion").css("color", "green");
    $(".question-confidence").css("display", "block");
  });

  $(".slider-one").change(function() {
    $scope.initialConfChanged = true;
    $("#output").css("color", "green");
    $(".initial-responses").css("display", "block");
    $(document).scrollTop($(document).height());
  });

  $(".slider-like-one").change(function() {
    $scope.sliderInitLikeChanged = true;
    $("#outputInitLike").css("color", "green");
  });

  $(".slider-comm-one").change(function() {
    $scope.sliderInitCommChanged = true;
    $("#outputInitComment").css("color", "green");
  });

  $(".slider-fact-one").change(function() {
    $scope.sliderInitFactChanged = true;
    $("#outputInitFactcheck").css("color", "green");
  });

  $(".slider-share-one").change(function() {
    $scope.sliderInitShareChanged = true;
    $("#outputInitShare").css("color", "green");
  });

  $(".slider-report-one").change(function() {
    $scope.sliderInitReportChanged = true;
    $("#outputInitReport").css("color", "green");
    $("#submit-button").css("display", "block");
    $(document).scrollTop($(document).height());
  });

  //Confirmation message before reload and back
  $window.onbeforeunload = function(e) {
    if ($scope.onbeforeunloadEnabled) {
      var dialogText = 'You have unsaved changes. Are you sure you want to leave the site?';
      e.returnValue = dialogText;
      return dialogText;
    }
  };

  //Setting the question one
  $http({
    method: 'POST',
    url: api + '/question',
    data: {
      set: $scope.questionSet,
      id: $scope.order[$scope.currentQIndex]
    },
    type: JSON,
  }).then(function(response) {
    $scope.currentQIndex += 1;
    $scope.question = response.data;

  }, function(error) {
    console.log("Error occured when getting the first question");
  });

  //Initialization
  $scope.myAnswer = {};
  $scope.myAnswer.initialOpinion = 50;
  $scope.myAnswer.initialConfidence = 50;
  $scope.myAnswer.initialFamiliarity = 50;

  $scope.myAnswer.initialLike = 50;
  $scope.myAnswer.initialComment = 50;
  $scope.myAnswer.initialShare = 50;
  $scope.myAnswer.initialReport = 50;
  $scope.myAnswer.initialFactcheck = 50;

  $scope.myAnswer.userId = $scope.userId;
  $scope.myAnswer.questionSet = $scope.questionSet;

  $scope.submitAnswer = function() {

    if ($scope.initialOpinionChanged && $scope.initialConfChanged && $scope.initialFamiliarityChanged && $scope.sliderInitLikeChanged && $scope.sliderInitCommChanged && $scope.sliderInitShareChanged && $scope.sliderInitReportChanged && $scope.sliderInitFactChanged) {
      //Diable the button and show loader
      $("#submit-button").attr('disabled', true);
      $("#submit-button").css('background-color', 'grey');
      $("#loader-one").css("display", "block");

      //Disbling the input
      $("input[type=radio]").attr('disabled', true);
      $("input[type=range]").attr('disabled', true);
      $("input[type=textarea]").attr('disabled', true);

      $scope.myAnswer.questionId = $scope.question.questionNumber;
      $scope.myAnswer.userId = $scope.userId;
      $scope.myAnswer.questionSet = $scope.questionSet;

      console.log($scope.myAnswer);

      $http({
        method: 'POST',
        url: api + '/feedback',
        data: $scope.myAnswer,
        type: JSON,
      }).then(function(response) {

        $scope.newAnswer = {};
        $scope.newAnswer.newOpinion = 50;
        $scope.newAnswer.newConfidence = 50;
        $scope.newAnswer.like = 50;
        $scope.newAnswer.comment = 50;
        $scope.newAnswer.share = 50;
        $scope.newAnswer.report = 50;
        $scope.newAnswer.factcheck = 50;

        $scope.manipulationChanged = false;
        $scope.newOpinionChanged = false;
        $scope.newConfChanged = false;

        $scope.sliderLikeChanged = false;
        $scope.sliderCommChanged = false;
        $scope.sliderShareChanged = false;
        $scope.sliderReportChanged = false;
        $scope.sliderFactChanged = false;

        $("#outputTwo").val("Not Specified");
        $("#outputTwo").css("color", "red");
        $("#outputNewOpinion").val("Not Specified");
        $("#outputNewOpinion").css("color", "red");
        $("#outputLike").val("Not Specified");
        $("#outputLike").css("color", "red");
        $("#outputComment").val("Not Specified");
        $("#outputComment").css("color", "red");
        $("#outputShare").val("Not Specified");
        $("#outputShare").css("color", "red");
        $("#outputReport").val("Not Specified");
        $("#outputReport").css("color", "red");
        $("#outputFactcheck").val("Not Specified");
        $("#outputFactcheck").css("color", "red");

        $(".image-area").css("display", "none");
        $(".image-area-two").css("display", "block");

        $(".question-area").css("display", "none");
        $(".change-area").css("display", "block");

        $("input[type=radio]").attr('disabled', false);
        $("input[type=range]").attr('disabled', false);
        $("input[type=textarea]").attr('disabled', false);
        window.scrollTo(0, 0);

      }, function(error) {
        console.log("Error occured when loading the chart");
      });
    }
  };

  $(".manipulation-radio-opinion").change(function() {
    $scope.manipulationChanged = true;
    $(".change-radio-opinion").css("display", "block");
  });

  $(".slider-new-opinion").change(function() {
    $scope.newOpinionChanged = true;
    $("#outputNewOpinion").css("color", "green");
    $(".change-confidence").css("display", "block");
  });

  $(".slider-two").change(function() {
    $scope.newConfChanged = true;
    $("#outputTwo").css("color", "green");
    $(".responses").css("display", "block");
    $(document).scrollTop($(document).height());
  });

  $(".slider-like").change(function() {
    $scope.sliderLikeChanged = true;
    $("#outputLike").css("color", "green");
  });

  $(".slider-comm").change(function() {
    $scope.sliderCommChanged = true;
    $("#outputComment").css("color", "green");
  });

  $(".slider-fact").change(function() {
    $scope.sliderFactChanged = true;
    $("#outputFactcheck").css("color", "green");
  });

  $(".slider-share").change(function() {
    $scope.sliderShareChanged = true;
    $("#outputShare").css("color", "green");
  });

  $(".slider-report").change(function() {
    $scope.sliderReportChanged = true;
    $("#outputReport").css("color", "green");
    $("#next-button").css("display", "block");
    $(document).scrollTop($(document).height());
  });

  $scope.update = function() {

    if ($scope.manipulationChanged && $scope.newOpinionChanged && $scope.newConfChanged && $scope.sliderLikeChanged &&
      $scope.sliderCommChanged && $scope.sliderShareChanged && $scope.sliderReportChanged && $scope.sliderFactChanged) {

      //Diable the button and show loader
      $("#next-button").attr('disabled', true);
      $("#next-button").css('background-color', 'grey');
      $("#loader-two").css("display", "block");

      //Disbling the input
      $("input[type=radio]").attr('disabled', true);
      $("input[type=range]").attr('disabled', true);
      $("input[type=textarea]").attr('disabled', true);

      $scope.newAnswer.questionId = $scope.question.questionNumber;
      $scope.newAnswer.userId = $scope.userId;
      $scope.newAnswer.questionSet = $scope.questionSet;
      console.log($scope.newAnswer);

      $http({
        method: 'POST',
        url: api + '/updateAnswer',
        data: $scope.newAnswer,
        type: JSON,
      }).then(function(response) {
        $scope.next();
      }, function(error) {
        console.log("Error occured when updating the answers");
      });
    }
  };

  $scope.next = function() {

    $scope.myAnswer = {};

    //Remove the question area and chart area
    $(".change-area").css("display", "none");
    $(".image-area-two").css("display", "none");
    //Reset the button and loader
    $("#next-button").attr('disabled', false);
    $("#next-button").css('background-color', '#117A65');
    $("#next-button").css('display', 'none');
    $("#loader-two").css("display", "none");

    $("input[type=radio]").attr('disabled', false);
    $("input[type=range]").attr('disabled', false);
    $("input[type=textarea]").attr('disabled', false);

    //Handling the ending of the quiz and directing to the big five questionnaire
    if ($scope.currentQIndex == 28) {
      //Disable the confirmation message
      $scope.onbeforeunloadEnabled = false;
      $window.location.href = './big-five.html';
    } else {
      $scope.userId = $window.sessionStorage.getItem('userId');
      var data = {
        set: $scope.questionSet,
        id: $scope.order[$scope.currentQIndex]
      };
      console.log($scope.currentQIndex);

      $http({
        method: 'POST',
        url: api + '/question',
        data: data,
        type: JSON,
      }).then(function(response) {

        //Display the new question area
        $(".image-area").css("display", "block");
        $(".question-radio-opinion").css("display", "none");
        $(".question-confidence").css("display", "none");
        $(".question-opinion").css("display", "none");
        $(".initial-responses").css('display', 'none');

        //Reset the loader and button
        $("#submit-button").attr('disabled', false);
        $("#submit-button").css('background-color', '#117A65');
        $("#submit-button").css('display', 'none');
        $("#loader-one").css("display", "none");
        $(".question-area").css("display", "block");

        $(".change-radio-opinion").css("display", "none");
        $(".change-confidence").css("display", "none");
        $(".change-opinion").css("display", "none");
        $(".responses").css("display", "none");
        $("#next-button").css("display", "none");

        $scope.myAnswer = {};
        $scope.myAnswer.initialOpinion = 50;
        $scope.myAnswer.initialConfidence = 50;
        $scope.myAnswer.initialFamiliarity = 50;

        $scope.myAnswer.initialLike = 50;
        $scope.myAnswer.initialComment = 50;
        $scope.myAnswer.initialShare = 50;
        $scope.myAnswer.initialReport = 50;
        $scope.myAnswer.initialFactcheck = 50;

        $scope.initialOpinionChanged = false;
        $scope.initialConfChanged = false;
        $scope.initialFamiliarityChanged = false;

        $scope.sliderInitLikeChanged = false;
        $scope.sliderInitCommChanged = false;
        $scope.sliderInitShareChanged = false;
        $scope.sliderInitReportChanged = false;
        $scope.sliderInitFactChanged = false;

        $scope.question = response.data;

        $("#output").val("Not Specified");
        $("#output").css("color", "red");
        $("#outputFamiliarity").val("Not Specified");
        $("#outputFamiliarity").css("color", "red");
        $("#outputInitialOpinion").val("Not Specified");
        $("#outputInitialOpinion").css("color", "red");

        $("#outputInitLike").val("Not Specified");
        $("#outputInitLike").css("color", "red");
        $("#outputInitComment").val("Not Specified");
        $("#outputInitComment").css("color", "red");
        $("#outputInitShare").val("Not Specified");
        $("#outputInitShare").css("color", "red");
        $("#outputInitReport").val("Not Specified");
        $("#outputInitReport").css("color", "red");
        $("#outputInitFactcheck").val("Not Specified");
        $("#outputInitFactcheck").css("color", "red");

        $scope.currentQIndex += 1;
        window.scrollTo(0, 0);

      }, function(error) {
        console.log("Error occured when loading the question");
      });
    }
  };


});
