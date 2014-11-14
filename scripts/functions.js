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
      temp = el.find("title").text().split(" | ");

      // récupert la chaine
      chaine = temp[0].trim();

      // si la chaine n'a pas déjà été prise en compte, on l'ajoute au chaînes
      if (chaines_temp.indexOf(chaine) == -1){
        index_chaine = chaines_temp.push(chaine) - 1;
        // index_chaine = programmes_temp.push([]) - 1;
        programmes_temp[index_chaine] = [];
      }
      // récupert la description et les commentaires (note)
      description = el.find("description").text();
      commentaires = el.find("comments").text();

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



$(document).on("pageshow", setRealContentHeight);



// var rss = "http://webnext.fr/epg_cache/programme-tv-rss_2014-11-03.xml";
var rss = "programme-local.xml";