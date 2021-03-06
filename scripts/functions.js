// met la page en 100% de haut
function setRealContentHeight() {
  var header = $.mobile.activePage.find("div[data-role='header']:visible");
  var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
  var content = $.mobile.activePage.find("div.ui-content:visible:visible");
  var viewport_height = $(window).height();

  // var content_height = viewport_height - header.outerHeight() - footer.outerHeight();
  var content_height = viewport_height - (header.outerHeight() - 1) - (footer.outerHeight() - 1);
  if((content.outerHeight() - header.outerHeight() - footer.outerHeight()) <= viewport_height) {
    content_height -= (content.outerHeight() - content.height());
  }
  $(".ui-content").height(content_height);
}



// récupert le programme tv d'après un flux RSS donné
function get_rss(rss, success){
  var temp = '';
  var chaine = '';
  var chaines_temp = [];
  var programmes_temp = [];
  var index_chaine = 0;
  var description = '';
  var commentaires = '';

  // pour stocker les chaînes et leurs programmes
  var chaines = [];

  $.get(rss, function (data) {
    $(data).find("item").each(function () { // or "item" or whatever suits your feed
      var el = $(this);

      // sépare les éléments du titre
      temp = el.find("title").text().replace("<![CDATA[", "").replace("]]>", "").split(" | ");

      // récupert la chaine
      chaine = temp[0].trim();

      // si la chaine n'a pas déjà été prise en compte, on l'ajoute au chaînes
      if (chaines_temp.indexOf(chaine) == -1){
        index_chaine = chaines_temp.push(chaine) - 1;
        // index_chaine = programmes_temp.push([]) - 1;
        programmes_temp[index_chaine] = [];
      }
      // récupert la description et les commentaires (note)
      description = el.find("description").text().replace("<![CDATA[", "").replace("]]>", "");
      commentaires = el.find("comments").text().replace("<![CDATA[", "").replace("]]>", "");

      // prépare l'élément représentant le programme et l'ajoute à la liste des programmes de la chaîne
      programmes_temp[index_chaine].push({heure: temp[1], titre: temp[2], description: description, commentaires: commentaires});
    });

    // parcourt toutes les chaines
    $.each(chaines_temp, function(index, value){
      // et on créé l'élément représentant la chaîne avec chacun de ses programmes
      chaines.push({nom: value, programme: programmes_temp[index]});
    });
    
    // appelle la fonction de callback avec en paramètre les chaînes trouvées    
    success(chaines);
  });
}



// affiche les chaînes et les programmes dans un élément "$element" donné
function affiche_chaines(programmetv, $element){
  // vérifie si l'élément donné existe dans le DOM
  if ($element.length == 0){
    return false;
  }

  // ajoute les chaînes
  $.each(programmetv, function(index, chaine){
    $element.append("<li><a href='#' data-chaineindex='" + index + "' class='chaine'>" + chaine.nom + "</a></li>");
  });

  // vibre
  // navigator.vibrate(1000);

  // lors d'un clic sur une chaîne, on affiche le programme de cette chaîne
  $('#chaines .chaine').on('click', function(event){
    event.stopPropagation();
    event.preventDefault();

    // récupert le programme de la chaîne
    var index = $(this).data('chaineindex');
    var ch = programmetv[index];

    // affiche le nom de la chaîne
    $('#page_chaine_programme .titre_chaine').html(ch.nom);
    $('#page_chaine_programme .programme_chaine').empty();

    // puis insère chacun des programmes
    $.each(ch.programme, function(index, programme){
      $contenu = $('<div class="programme"><div class="ui-corner-all custom-corners"><div class="ui-bar ui-bar-a"><h3>' + programme.heure + ' - ' + programme.titre + '</h3></div><div class="ui-body ui-body-a"><p>' + programme.description + '</p><div><a href="#" class="share" data-sharetitle="' + programme.titre + '" data-sharetext="' + programme.description + '"><i class="fa fa-share-alt" style="font-size: 2.5em; color: #000;"></i></a></div></div></div></div>');
      $('#page_chaine_programme .programme_chaine').append($contenu);
    });

    document.location = '#page_chaine_programme';
  });
}



function loadStylesheet(url){
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  $('head').append(link);
}



function init(){
  // met la page en 100% de haut
  $(document).on("pageshow", setRealContentHeight);

  // lorsque le périphérique est prêt
  $(document).on("deviceready", function(){
    // on vérifie sur quelle plateforme on est
    var platform = device.platform;
    // si on est sur iOS, on charge une feuille de style spéciale pour iOS
    if (platform == 'iOS'){
      loadStylesheet("css/ios.css");
    }
  });

  // charge le menu
  $(document).on("pageshow", function(){
    $(".nav-menu").load("menu.html", function(){
      $(".nav-menu").panel();
      $(".nav-menu").trigger("updatelayout");
    });
  });



  // pour raffraichir le programme TV
  $(document).on("click", "button.refresh", function(){
    // on affiche un loader
    $.mobile.loading( "show", {
      text: "Chargement du programme TV",
      textVisible: true,
      theme: 'b',
      textonly: false,
      html: ""
    });

    // charge le programme TV
    get_rss(rss, function(data){
      // le stock (avec la date pour vérifier ensuite qu'on a bien le programme du jour)
      var programmetv = {
        date: date,
        programme: data
      }

      localStorage.setItem("programmetv", JSON.stringify(programmetv));

      // vide les chaînes
      $('#chaines').empty();

      // affiche les chaînes
      affiche_chaines(programmetv.programme, $('#chaines'));

      // raffraichit la liste
      $('#chaines').listview("refresh");

      // puis on masque le loader
      $.mobile.loading("hide");

      // vibre
      navigator.vibrate(1000);
    });
  });



  // pour le partage des programmes Tv
  $(document).on("click", ".share", function(event){
    event.stopPropagation();
    event.preventDefault();

    var title = $(this).data('sharetitle');
    var text = $(this).data('sharetext');
    navigator.share(text,title)
  });
}