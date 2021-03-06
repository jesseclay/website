$(function () {
    $('svg.contributors')[0].pauseAnimations();

    var $shapes = $('#shapes'),
        $shapesDefs = $shapes.find('defs'),
        $contributors = $('.contributors', '.persons'),
        $persons = $('.persons'),
        personsWidth = $persons.width(),
        personsHeight = $persons.height(),
        iconWidth = 60, iconHeight = 70,
        rowsCount = Math.round(personsHeight / iconHeight),
        countInRow = 0,
        iconCount = 0;

    var rowWidth = 0;

    $(window).on('load', function () {
        setTimeout(function () {
            getContributors();
            $('svg.contributors')[0].unpauseAnimations();
        }, 5000);
    });

    function getContributors() {
        $.get('https://contributors.cloud.ipfs.team/contributors?org=all', function (items) {
            iconCount = items.length;
            countInRow = Math.ceil(items.length / rowsCount);
            rowWidth = countInRow * (iconWidth + 20);
            $('.contributors', '.persons').width(rowWidth);
            items.forEach(function (item, index) {
                var imgId = 'img' + index;

                var pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
                pattern.setAttributeNS(null, 'id', imgId);
                pattern.setAttributeNS(null, 'patternContentUnits', 'objectBoundingBox');
                pattern.setAttributeNS(null, 'height', '100%');
                pattern.setAttributeNS(null, 'width', '100%');

                var img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                img.setAttributeNS(null, 'width', '1');
                img.setAttributeNS(null, 'height', '1');
                img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', item.photo);
                img.setAttributeNS(null, 'preserveaspectratio', 'none');

                pattern.appendChild(img);

                $shapesDefs.append(pattern);

                var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

                var indexRow = Math.floor(index / countInRow),
                    y = indexRow * (iconHeight - 10),
                    indexInRow = index - (countInRow * indexRow),
                    offsetX = indexRow % 2 * ((iconWidth + (indexInRow !== 0 ? 20 : 0)) / 2),
                    x = indexInRow * (iconWidth + (indexInRow !== 0 ? 20 : 0)) + offsetX;

                var person = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                person.setAttributeNS(null, 'id', 'icon' + index);
                person.setAttributeNS(null, 'width', iconWidth);
                person.setAttributeNS(null, 'height', iconHeight);
                person.setAttributeNS(null, 'x', x);
                person.setAttributeNS(null, 'y', y);
                person.setAttributeNS(null, 'fill', 'url(#' + imgId + ')');
                person.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#shape-icon');
                person.setAttribute('data-url', item.url);
                person.setAttribute('data-username', item.username);
                person.setAttribute('data-index', indexInRow);
                person.setAttribute('data-row', indexRow);
                person.setAttribute('data-position', (indexInRow === 0 ? 'first'
                    : (indexInRow === (countInRow - 1) || index === (items.length - 1)) ? 'last' : ''));

                g.appendChild(person);

                var animateX = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                animateX.setAttributeNS(null, 'attributeName', 'x');
                animateX.setAttributeNS(null, 'from', '0');
                animateX.setAttributeNS(null, 'to', (iconWidth * (-1)));
                animateX.setAttributeNS(null, 'repeatCount', 'indefinite');
                animateX.setAttributeNS(null, 'fill', 'freeze');
                animateX.setAttributeNS(null, 'additive', 'sum');
                animateX.setAttributeNS(null, 'accumulate', 'sum');
                animateX.setAttributeNS(null, 'dur', '10s');
                animateX.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#icon' + index);

                g.appendChild(animateX);

                var rnd1 = Math.floor(Math.random() * 15);
                var rnd2 = Math.floor(Math.random() * 15);

                var animateY = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                animateY.setAttributeNS(null, 'attributeName', 'y');
                animateY.setAttributeNS(null, 'from', (y));
                animateY.setAttributeNS(null, 'to', (y + 10));
                animateY.setAttributeNS(null, 'repeatCount', 'indefinite');
                animateY.setAttributeNS(null, 'values', (y) + '; ' + (y + rnd1) + '; ' + (y + rnd2) + '; ' + y);
                animateY.setAttributeNS(null, 'keyTimes', '0; 0.3; 0.6; 1');
                animateY.setAttributeNS(null, 'fill', 'freeze');
                animateY.setAttributeNS(null, 'dur', '20s');
                animateY.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#icon' + index);

                g.appendChild(animateY);

                $contributors.find('#group-icons').append(g);

                $('#icon' + index)
                    .mouseenter(mouseEnter)
                    .mouseleave(mouseLeave)
                    .on('click', mouseClick)
            })
        });
    }

    function mouseClick() {
        var url = $(this).attr('data-url');
        if (url.length) {
            window.open(url)
        }
    }

    function mouseLeave() {
        var el = $(this);
        el.closest('#group-icons').find('.tooltip').remove();
        // el.closest('#group-icons').find('.hex-hover').remove();

        el.attr('width', (iconWidth));
        el.attr('height', (iconHeight));

        el.closest('svg')[0].unpauseAnimations()
    }

    function mouseEnter() {
        var el = $(this),
            elX = el[0].x.animVal.value,
            elY = el[0].y.animVal.value;
        el.closest('svg')[0].pauseAnimations();

        var $parent = el.closest('#group-icons');

        // $parent[0].appendChild(hexHover(elX - 3, elY - 3, iconWidth + 6, iconHeight + 6));

        el.attr('width', (iconWidth + 5));
        el.attr('height', (iconHeight + 5));

        $parent[0].appendChild(tooltip(el.attr('data-username')));

        var $tooltip = $parent.find('.tooltip');
        $tooltip.attr('transform', 'translate(' + (elX + 65) + ',' + (elY + 20) + ')')
    }

    // reposition first icon to last
    setInterval(function () {
        for (var n = 0; n < rowsCount; n++) {
            var $firstIcon = $('use[data-row=' + n + ']' + '[data-position=first]'),
                firstIconX = $firstIcon[0].x.animVal.value;
            if (!$firstIcon.length || firstIconX > (iconWidth * (-1))) continue;

            var firstIconIndex = parseInt($firstIcon.attr('data-index')),
                nextIndex = firstIconIndex < countInRow ? firstIconIndex + 1 : 0,
                $nextIcon = $('use[data-row=' + n + ']' + '[data-index=' + nextIndex + ']');

            var $firstIconAnim = $firstIcon.closest('g').find('animate[attributeName="x"]');

            var $lastIcon = $('use[data-row=' + n + ']' + '[data-position=last]'),
                lastIconX = $lastIcon[0].x.animVal.value;

            $firstIcon[0].setAttribute('data-position', 'last');
            $nextIcon[0].setAttribute('data-position', 'first');
            $lastIcon[0].setAttribute('data-position', '');

            var $firstIconparent = $firstIcon.closest('g'),
                clone = $firstIconparent.get(0);
            $firstIconparent.remove();

            $(clone).find('use').attr('x', (lastIconX + iconWidth + 20));
            var id = $(clone).find('use').attr('id');
            $('#group-icons').append(clone);
            var $el = $('#' + id);
            $el.closest('g').find('[attributeName=x]')[0].beginElement();
            $el
                .mouseenter(mouseEnter)
                .mouseleave(mouseLeave)
                .on('click', mouseClick)
        }
    }, 1000);

    function tooltip(username) {
        var gTitle = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        gTitle.setAttributeNS(null, 'class', 'tooltip');

        // var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        // use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#shape-tooltip');
        // use.setAttribute('width', '170');
        // use.setAttribute('height', '39');
        // gTitle.appendChild(use);

        var filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'tooltip-shadow');
        filter.setAttribute('width', '150%');
        filter.setAttribute('height', '150%');

        var feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
        feOffset.setAttribute('result', 'offOut');
        feOffset.setAttribute('in', 'SourceGraphic');
        feOffset.setAttribute('dx', '3');
        feOffset.setAttribute('dy', '3');
        filter.appendChild(feOffset);

        var feColorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
        feColorMatrix.setAttribute('result', 'matrixOut');
        feColorMatrix.setAttribute('in', 'offOut');
        feColorMatrix.setAttribute('type', 'matrix');
        feColorMatrix.setAttribute('values', '0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0');
        filter.appendChild(feColorMatrix);

        var feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('result', 'blurOut');
        feGaussianBlur.setAttribute('in', 'matrixOut');
        feGaussianBlur.setAttribute('stdDeviation', '3');
        filter.appendChild(feGaussianBlur);

        var feBlend = document.createElementNS('http://www.w3.org/2000/svg', 'feBlend');
        feBlend.setAttribute('in', 'SourceGraphic');
        feBlend.setAttribute('in2', 'blurOut');
        feBlend.setAttribute('mode', 'normal');
        filter.appendChild(feBlend);

        gTitle.appendChild(filter);

        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('style', 'fill:#fff; stroke:#b3b3b3; stroke-miterlimit: 10; opacity: 1');
        path.setAttribute('d', 'M1.12,13.5,8.58,9.36a3,3,0,0,0,1.54-2.62V3.5a3,3,0,0,1,3-3h145a3,3,0,0,1,3,' +
            '3v19a3,3,0,0,1-3,3h-145a3,3,0,0,1-3-3V19.45a3,3,0,0,0-1.78-2.74Z');
        path.setAttribute('filter', 'url(#tooltip-shadow)');

        gTitle.appendChild(path);

        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttributeNS(null, 'x', '15');
        text.setAttributeNS(null, 'y', '17');
        text.textContent = username;
        gTitle.appendChild(text);

        return gTitle
    }

    var x, left, down;

    $('.svg-wrapper')
        .mousedown(function (e) {
            e.preventDefault();
            down = true;
            x = e.pageX;
            left = $(this).scrollLeft()
        })
        .mousemove(function (e) {
            if (down) {
                var newX = e.pageX;
                $('.svg-wrapper').scrollLeft(left - newX + x)
            }
        });
    // .bind('DOMMouseScroll mousewheel', function (e) {
    //     e.preventDefault();
    //     left = $(this).scrollLeft();
    //     var delta = e.originalEvent.wheelDelta || (-e.originalEvent.detail * 10);
    //     $('.svg-wrapper').scrollLeft(left - delta);
    // });
    $('body').mouseup(function (e) {
        down = false
    })
});
