export class Utils {
  public static getKey<T>(key: any, obj: T) {
    for (const k in obj) {
      if (key === k) {
        return k;
      }
    }
  }
}