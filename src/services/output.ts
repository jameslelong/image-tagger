import { EditorImage } from 'types/image';
import Vector2 from 'types/vector2';

export default class JsonHandler {
  // todo - need a proper Json structure to use
  // todo - "rectangle"s need to be linked to images in the output JSON

  public output(images: Array<EditorImage>): void {
    const output = new Array<object>();

    // Loop Images
    images.forEach(image => {
      // Loop Groups of Image
      image.selectionGroup.forEach(group => {
        // Loop Selections of Group
        group.selections.forEach(selection => {
          const topLeft: Vector2 = selection.findTopLeft();

          output.push({
            rectangle: {
              x: topLeft.x,
              y: topLeft.y,
              h: selection.absHeight,
              w: selection.absHeight
            },
            object: group.linkedTag.name
          });
        }); 
      });
    });
    
    this.generateDownload(JSON.stringify(output));
  }

  private generateDownload(output: string) {
    const element = document.createElement('a');
    element.style.display = 'none';
    
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(output));
    element.setAttribute('download', 'output.json');

    document.body.appendChild(element);
  
    element.click();
    element.remove();
  }
}