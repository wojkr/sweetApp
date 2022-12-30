const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show')
        } else {
            entry.target.classList.remove('show')
        }
    })

})

const elements = document.querySelectorAll(".hidden")
elements.forEach((e) => observer.observe(e))

console.log(elements)