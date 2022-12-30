const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show')
            entry.target.style.pointerEvents = 'none'
            const timeout = Number(window.getComputedStyle(entry.target).getPropertyValue('transition-duration').replace('s', ''));
            setTimeout(() => {
                entry.target.style.pointerEvents = 'all'

            }, timeout * 1000)
        } else {
            entry.target.classList.remove('show')
        }
    })
})

const setRowsOfElements = (e) => {
    if (rowsOfElements.length !== 0) {
        if (rowsOfElements[rowsOfElements.length - 1].top == e.offsetTop) {
            rowsOfElements[rowsOfElements.length - 1].el.push(e);
        } else {
            rowsOfElements[rowsOfElements.length] = {
                top: e.offsetTop,
                el: [e]
            }
        }
    } else {
        rowsOfElements = [{
            top: e.offsetTop,
            el: [e]
        }]
    }
}

const addDelay = (rows) => {
    rows.forEach(r => {
        for (i = 0; i < r.el.length; i++) {
            r.el[i].style.transitionDelay = `${(r.el.length - 1 - i) * 20}ms`
        }
    })
}


const elements = document.querySelectorAll(".hidden")

let rowsOfElements = []

elements.forEach((e) => {
    observer.observe(e);
    setRowsOfElements(e)
    addDelay(rowsOfElements)
})
