# Colisao-de-particulas

> Status: Concluído.

Uma lib simples para criar uma animação de colisão de partículas no canvas.

## Como usar?

Basta importar e instanciar o módulo passando um `HTMLCanvasElement` como argumento, e logo em seguida invocando o método `start`.
Você também pode usar o método `stop`, para parar a animação sempre que necessário;

```html
<script type="module">
  import createParticlesAnimation from "./particles.js";

  const particlesAnimation = createParticlesAnimation(document.querySelector("#canvas"));

  window.onload = particlesAnimation.start;
  
  particlesAnimation.stop();
</script>
```
