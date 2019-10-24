export class Utils {
  public static getKey<T>(key: any, obj: T) {
    for (const k in obj) {
      if (key === k) {
        return k;
      }
    }
  }

  public static trimRoute(route: string): string {
    let output = route;
    if (output.charAt(0) === '/') {
      output = output.slice(1);
    }
    if (output.charAt(output.length - 1) === '/') {
      output = output.slice(0, output.length - 1);
    }
    return output;
  }
}