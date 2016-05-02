
$(document).ready(function () {
	console.log('En home CineHoyts!!');
	var muestra_rating = true;
	var orden_rating = 1; // 1 desc (rating de mayor a menor), -1 asc (rating de menor a mayor)
	var imdb_img = chrome.extension.getURL('img/imdb.png');

	// obtiene ratings al cambiar ubicación
	$(document).on('DOMNodeInserted', '.listCartelera', function(e) {
		if($(e.target).hasClass('item')) {
			pelicula = $(e.target);
			tiene_imdb = typeof pelicula.attr('data-rating') !== typeof undefined;
			if(!tiene_imdb) agrega_imdb(pelicula);
		}
	});

	// obtiene ratings al inicio
	$('.listCartelera li').each(function() {
		pelicula = $(this);
		// no es película (botón cartelera completa)
		if(pelicula.find('.sellos h1').length == 0) {
			return;
		}
		if(!pelicula.hasClass('cartel_oculto')) {
			pelicula.addClass('cartel_visible');
		}
		agrega_imdb(pelicula);
	});

	function agrega_imdb(pelicula) {
		var titulo = pelicula.find('.sellos h1').text();
		pelicula.attr('data-titulo', titulo);
		pelicula.attr('data-rating', '0');
		var url = 'http://www.imdb.com/find?q=' + titulo + '&s=tt&ttype=ft';
		$.ajax({
	        url: url,
	        type: "GET",
	        dataType: "html",
	          success: function(html) {
				  html = html.replace(/<img[^>]*>/g,"");
				  html = $(html);
				  
				  // sin resultados
				  if(html.find('.findNoResults').length > 0) {
					  return;
				  }
				  
				  split = html.find('.findList .findResult:first .result_text a').attr('href').split('/');
				  id = split[2];
				  
				  if(muestra_rating) {
					  link_rating(id, pelicula);
			  	  } else {
	  			  	imdb_link = '<a href="http://www.imdb.com/title/' + id + '" target="_blank"><img src="' + imdb_img + '"></a>';
	  			  	pelicula.find('.overlay .opcion-sellos .btn-call').prepend(imdb_link);
			  	  }
	          }
	    });
	}
	
	function link_rating(imdb_id, pelicula) {
		var url = 'http://www.imdb.com/title/' + imdb_id + '/';
		$.ajax({ 
		    type: "GET",
		    dataType: "html",
		    url: url,
		    success: function(html){
				html = html.replace(/<img[^>]*>/g,"");
				html = $(html);
				rating = html.find('.imdbRating .ratingValue span[itemprop="ratingValue"]').text();
				pelicula.attr('data-rating', rating.replace(',', '.'));
				imdb_link = '<span class="imdbRatingPlugin imdbRatingStyle1" data-title="' + imdb_id + '" data-style="t1"><a href="http://www.imdb.com/title/' + imdb_id + '" class="imdb" target="_blank"><img src="' + imdb_img + '"></a><span class="rating">' + rating + '<span class="ofTen">/10</span></span></span>';
  			  	pelicula.find('.overlay .opcion-sellos .btn-call').prepend(imdb_link);
				
				// ordenar
				ordenar();
		    },
		    async: true,
		    error: function() {
		        return "Movie not found.";
		    }
		});
	}

	function ordenar() {
		var peliculas = $('.listCartelera li.item:not(.cartel_oculto)');
		
		peliculas.sort(function(a,b){
			var ar = parseFloat(a.getAttribute('data-rating')),
				br = parseFloat(b.getAttribute('data-rating'));
			
			//console.log('Comparando ' + a.getAttribute('data-titulo') + ' (' + ar.toString() + ')' + ' - ' + b.getAttribute('data-titulo') + ' (' + br.toString() + ')');

			if(ar > br) {
				return -1 * orden_rating;
			}
			if(ar < br) {
				return 1 * orden_rating;
			}
			return 0;
		});
		
		var fila = 0;
		var columna = 0;
		peliculas.each(function(index) {
			$(this).attr('id', 'ContentPlaceHolder1_rpCarteleaFront_li_carteles_' + index);
			leftpx = columna * 158;
			toppx = fila * 250;
			$(this).attr('style', 'position: absolute; left: ' + leftpx + 'px; top: ' + toppx + 'px;');
			
			if(columna == 4) {
				columna = 0;
				fila++;
			} else {
				columna++;
			}
		});
		
		peliculas.detach();
		$('.listCartelera').prepend(peliculas);		
	}
	
	// agrega filtro para ordenar por rating
	if(muestra_rating) {
		texto_link = orden_rating == 1? 'Rating ↓ (mayor a menor)' : 'Rating ↑ (menor a mayor)';
		filtro = $('<div class="col3"><h3>Rating <img src="' + imdb_img + '"></h3><div><a href="#" id="ordenar_rating">' + texto_link + '</a></div></div>');
		// al clickear ordenar
		filtro.find('#ordenar_rating').click(function() {
			// ordena por rating
			orden_rating *= -1; // orden opuesto
			texto_link = orden_rating == 1? 'Rating ↓ (mayor a menor)' : 'Rating ↑ (menor a mayor)';
			$(this).text(texto_link);
			
			ordenar();		
			return false;
		});
		
		// agrega filtro
		$('section.cartelera header.cf h2.col9').attr('class', 'col6');
		$('section.cartelera header.cf').append(filtro);
	}
	
	// evento click consultar cartelera
	$(document).on('click', '.btnConsultar', function() {
		$('.listCartelera li.cartel_oculto').removeClass('cartel_oculto').addClass('item cartel_visible');
		ordenar();
	});
	
});

