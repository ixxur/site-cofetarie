window.onload = function() {
    document.getElementById("filtrare").onclick = function(){
        var inpNume = document.getElementById("inp-nume").value.toLowerCase().trim();
        var inpCategorieSimplu= document.getElementById("inp-categorie-simplu").value;
        var inpCategorieMultiplu = document.getElementById("inp-categorie-multiplu").value;
        console.log(inpCategorieMultiplu);
        var produse = document.getElementsByClassName("produs");

        for(let produs of produse){
            var cond1 = false, cond2 = false, cond3 = false, cond4 = false, cond5 = false;
           
            produs.style.display = "none";
            let nume = produs.getElementsByClassName("val-nume")[0].innerHTML.toLocaleLowerCase().trim();
            if(nume.includes(inpNume)){
                cond1 = true;
            }
            let categorieSimplu = produs.getElementsByClassName("val-categorie")[0].innerHTML;
            if(inpCategorieSimplu == "toate" || categorieSimplu == inpCategorieSimplu){
                cond2 = true;
            }
            let categorieMultiplu = produs.getElementsByClassName("val-categorie")[0].innerHTML;
            if(inpCategorieMultiplu == "toate" || inpCategorieMultiplu.includes(categorieMultiplu)){
                cond3 = true;
            }

            if(cond1 && (cond2 || cond3)){
                produs.style.display = "block";
            }
        }
    }
}