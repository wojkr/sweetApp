const pics = document.getElementsByClassName(imgClassName);
for (var i = 0; i < pics.length; i++) {
    pics[i].onerror = function () {
        this.src = defaultImg;
    }
};