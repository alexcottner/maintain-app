export const button = {
  background: "#000",
  style: {
    backgroundColor: "#333",
    margin: 5,
    borderColor: "#000",
    shadowColor: "#000"
  }
};

export const image = {
  width: '100%',
  resizeMode: 'contain',
  aspectRatio: 4/3
};

export const text = {
  color: "#fff"
}

export const container = {
  flex: 1,
  backgroundColor: '#000',
  color: '#fff',
  width: '100%'
};

export const itemContainer = {
  flexDirection: 'row',
  padding: 10,
  borderBottomColor: '#888',
  borderBottomWidth: 1
};

export const input = {
  backgroundColor: '#222',
  color: '#fff',
  padding: 10,
  borderRadius: 5,
};

export const label = {
  color: '#fff',
  fontSize: 16,
  marginTop: 10,
};

export function labelOffset() {
  return {
    color: '#fff',
    fontSize: 16 + (global.prefs.fontOffset || 0),
    marginTop: 10,
  };
}

export function inputOffset() {
  return {
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    fontSize: 14 +  (global.prefs.fontOffset || 0)
  };
}

export function buttonOffset() {
  return {
    background: "#000",
    style: {
      backgroundColor: "#333",
      margin: 5,
      borderColor: "#000",
      shadowColor: "#000",
      fontSize: 16 + (global.prefs.fontOffset || 0)
    }
  }
}

export function textOffset() {
  return {
    color: "#fff",
    fontSize: 14 + (global.prefs.fontOffset || 0)
  };
}

export function pickerOffset() {
  return {
    view: {
      height: 35 + (global.prefs.fontOffset || 0),
        overflow: 'hidden',
        alignContent: 'center',
        borderRadius: 5
    },
    picker: {
      color: "#fff",
      fontSize: 14 + (global.prefs.fontOffset || 0),
      backgroundColor: '#333',
      marginTop: -8
    },
    item: {
      color: "#fff",
      backgroundColor: '#333',
      fontSize: 14 + (global.prefs.fontOffset || 0)
    }
  };
}
