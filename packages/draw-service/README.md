# @unitybase/draw-service

Micro service for creating PNG picture based on series of commands

```bash
npm i @unitybase/draw-service
node ./node_modules/@unitybase/draw-service
```
To use custom port (default is 8882) or custom font (default is times)

```bash
npm i @unitybase/draw-service
PORT=8883 FONT=path/to/your/font.ttf  node ./node_modules/@unitybase/draw-service
```


```javascript
cmd = {
  imgWidth: 300,
  imgHeight: 200,
  fillStyle: '#AAAAAA',
  fontSize: 20,
  commands: [
    {
      type: 'png',
      x: 0,
      value: 'iVBORw0KGgoAAAANSUhEUgAAAOcAAAB8CAMAAACli1eSAAAABGdBTUEAALGPC/xhBQAAAwBQTFRFAAAAAQEBAgICAwMDBAQEBQUFBgYGBwcHCAgICQkJCgoKCwsLDAwMDQ0NDg4ODw8PEBAQEREREhISExMTFBQUFRUVFhYWFxcXGBgYGRkZGhoaGxsbHBwcHR0dHh4eHx8fICAgISEhIiIiIyMjJCQkJSUlJiYmJycnKCgoKSkpKioqKysrLCwsLS0tLi4uLy8vMDAwMTExMjIyMzMzNDQ0NTU1NjY2Nzc3ODg4OTk5Ojo6Ozs7PDw8PT09Pj4+Pz8/QEBAQUFBQkJCQ0NDRERERUVFRkZGR0dHSEhISUlJSkpKS0tLTExMTU1NTk5OT09PUFBQUVFRUlJSU1NTVFRUVVVVVlZWV1dXWFhYWVlZWlpaW1tbXFxcXV1dXl5eX19fYGBgYWFhYmJiY2NjZGRkZWVlZmZmZ2dnaGhoaWlpampqa2trbGxsbW1tbm5ub29vcHBwcXFxcnJyc3NzdHR0dXV1dnZ2d3d3eHh4eXl5enp6e3t7fHx8fX19fn5+f39/////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgvYACQAAAQB0Uk5T////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AFP3ByUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMjHxIGmVAAAN8ElEQVR4Xu2ci1/UxhbHz4bdhUXerHoVEBX0KkXrA2xprW0v+KpiK+q13ra+qq1aH7TF3lpq6X+entckk93JY2myXLh8Px8yM9lkJr9kMnPmzATw/z/Y1rm12Na5tdjWubXY1rm12NaZC+WyRlKowrTGCqJQne8CwA6NJzKPBy5rvBiK1Hn4mO9/Bp9oKgmAJ5tX5xHOO4vOA/DG79+sOh9L1lkKgBpq3aw6oY+DTt4mchv+wMM3qc6dkvODCxwkArtoszl1voIbHGaqtgu02Zw6+yTjm3c4SOQjPrSoC1EKyv4pfMUh1cg0vL24WdqcOiv7JeBtMr/yJSxd4URhFKRTsj0nTW4yB/jYK/L8C6MYnYcPcpDJ5oPduFkr6H4HFJL/W+Dmp4MTKTzghnZz6qyzceDd40QKx/gKqlkarL9DITphHDfH35dECvAubb0TnCiOInTOUaYH35NECmuwQkEht9umiALK+Hbuf0cTKXw+RNtnVU4USAE6lynPoxJPRSrs8GVOFEgBOid6sFPUeCpwibdrnCiQAnTCM7WD+qg5SuZnKX/9VzEKmVr1QnS+6vldIl0cJFHvp+3+rzmxDi4BZFOQv85aUDIMaCSeGh8CP3Kida5BdddG6fR05JlJJ3zPW463zm26pRuk8wRc1Ngc/KKxWBa4+AsfcKJ1KoC2yAbppFv8H34xx+BX3pMAWxTrvwZ+Q7Kdve4yYsB24dYwboSBW7o7huFB3Px3pyRaBni4sBE6/1B9MLO4eFBiiVYu3MdN7V+SaJXvYZiCDdDZRcKe0gYTZBa9GACYkt9crLDO9V5CDd5Q0HadZRi9fx67bfgMqCay+ef7PUE308wy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'
    }, {
      fontSize: 25,
      x: 0,
      y: 50,
      value: `?????????? 25: ????????????\nnew line\n ???????? ???????????? ?????????? ???? ???????????????????????? ???? ???????????? ????????????`
    }, {
      type: 'rect',
      fillStyle: 'rgba(0, 0, 255, 0.5)',
      x: 50,
      maxWidth: 50,
      maxHeight: 150
    }
  ]
}

fetch('http://localhost:8882', {method: 'POST', body: JSON.stringify(cmd)}).then((imageBin) => {doSomething(imageBin)})
```

Can draw text, png image, rect - see `./text/test.js` for sample

## Limitations
 - supports only ONE font (Times New Roman by default). Or font the path to whitch one is passed in FONT env variable
 - small font size can cause bad antialiasing
