const pics = document.getElementsByClassName(imgClassName);
if (pics.src = "") {
    pics.src = defaultImg;
}
for (var i = 0; i < pics.length; i++) {
    pics[i].onerror = function () {
        this.src = defaultImg;
    }
};