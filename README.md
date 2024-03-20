# Colisao-de-particulas

> Status: Concluído.

Uma lib simples para criar uma animação de colisão de partículas no canvas.

## Como usar?

Basta importar e instanciar o módulo passando um `HTMLCanvasElement` como argumento, e logo em seguida invocando o método `start`.
Você também pode usar o método `stop`, para parar a animação sempre que necessário;

```html
<script defer type="module">
  import createColissionParticlesAnimation from "https://cdn.jsdelivr.net/gh/Silenc3rz/Colisao-de-particulas/particles.js";

  const particlesAnimation = createColissionParticlesAnimation(document.querySelector("#canvas"), { r: 255, g:255, b: 255 });

  particlesAnimation.start();
  
  particlesAnimation.stop();

  particlesAnimation.changeColor({ r: 0, g: 0, b: 0 });
</script>
```
