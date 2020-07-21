import Vector2 from "types/vector2";

export enum SelectionPoint {
  a,
  b,
  c,
  d
}

export class Selection {
  private _a: Vector2;
  private _b: Vector2;
  private _c: Vector2;
  private _d: Vector2;

  get a(): Vector2 {
    return this._a;
  }

  set a(pos: Vector2) {
    this._a = pos;

    this._b = new Vector2(this.c.x, pos.y);
    this._d = new Vector2(pos.x, this.c.y);
  }

  get b(): Vector2 {
    return this._b;
  }

  set b(pos: Vector2) {
    this._b = pos;

    this._a = new Vector2(this.d.x, pos.y);
    this._c = new Vector2(pos.x, this.d.y);
  }

  get c(): Vector2 {
    return this._c;
  }

  set c(pos: Vector2) {
    this._c = pos;

    this._b = new Vector2(pos.x, this.a.y);
    this._d = new Vector2(this.a.x, pos.y);
  }

  get d(): Vector2 {
    return this._d;
  }

  set d(pos: Vector2) {
    this._d = pos;

    this._a = new Vector2(pos.x, this.b.y);
    this._c = new Vector2(this.b.x, pos.y);
  }

  get absHeight(): number {
    return Math.abs(this.a.x - this.c.x);
  }

  get absWidth(): number {
    return Math.abs(this.a.y - this.c.y);
  }

  get relHeight(): number {
    return this.a.x > this.c.x ? -this.absHeight : this.absHeight;
  }

  get relWidth(): number {
    return this.a.y > this.c.y ? -this.absWidth : this.absWidth;
  }

  constructor(pos: Vector2) {
    this._a = this._b = this._c = this._d = pos;
  }

  public genericPointGet(sp: SelectionPoint): Vector2 {
    switch (sp as SelectionPoint) {
    case SelectionPoint.a:
      return this.a;
    case SelectionPoint.b:
      return this.b;
    case SelectionPoint.c:
      return this.c;
    case SelectionPoint.d:
      return this.d;
    }
  }

  public genericPointSet(sp: SelectionPoint, pos: Vector2): void {
    switch (sp as SelectionPoint) {
    case SelectionPoint.a:
      this.a = pos;
      break;
    case SelectionPoint.b:
      this.b = pos;
      break;
    case SelectionPoint.c:
      this.c = pos;
      break;
    case SelectionPoint.d:
      this.d = pos;
      break;
    }
  }
}