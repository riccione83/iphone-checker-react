/* eslint-disable array-callback-return */
import React, { useEffect, useState } from "react";
import axios from "axios";

function IphoneChekerView() {
  const [av, setAv] = useState<{ [store: string]: any }>({});

  const fetchData = () => {
    setAv({});
    // Add the store list by name like below
    let storesList = ["Bromley", "Battersea", "Covent Garden", "Regent Street"];

    //Add phone model and a description. Only model should match Apple's official model name
    let modelList = [
      { model: "MTV63ZD/A", description: "15 Pro (256GB Blue)" },
      { model: "MU7A3ZD/A", description: "15 Pro MAX  (256GB Blue)" },
      { model: "MU1F3ZD/A", description: "Iphone 15 blue" },
    ];
    let availability: any = {};

    axios
      .all([
        axios.get(
          "https://reserve-prime.apple.com/GB/en_GB/reserve/A/stores.json"
        ),
        axios.get(
          "https://reserve-prime.apple.com/GB/en_GB/reserve/A/availability.json"
        ),
      ])
      .then((responseArr) => {
        const stores = responseArr[0].data;
        availability = responseArr[1].data;
        const s = stores["stores"]?.filter((s: any) =>
          storesList.includes(s.storeName)
        );
        let a: { [store: string]: any } = {};
        s.map((st: any) => {
          const storeNumber = st.storeNumber ?? "";
          modelList.map((ml) => {
            if (a[st.storeName + " [" + ml.description + "]"] === undefined) {
              a[st.storeName + " [" + ml.description + "]"] = [];
            }
            a[st.storeName + " [" + ml.description + "]"] =
              availability["stores"][storeNumber][ml.model] ?? "";

            // console.info(a[st.storeName + " [" + ml.description + "]"]);
          });
        });
        setAv(a);
      })
      .catch((e) => console.error("Error!!:", e));
  };

  useEffect(() => {
    const interval = setInterval(function () {
      fetchData();
    }, 600000);

    return () => clearTimeout(interval);
  }, [av]);

  useEffect(() => {
    fetchData();
  }, []);

  const getItems = () => {
    let items: any[] = [];
    // eslint-disable-next-line array-callback-return
    Object.entries(av)?.map((i: any) => {
      if (i[1].availability && Object.hasOwn(i[1].availability, "contract")) {
        if (
          i[1]?.availability?.contract === true ||
          i[1]?.availability?.unlocked === true
        ) {
          playSound();
        }
        const v = {
          store: i[0],
          contract: i[1]?.availability.contract,
          unlocked: i[1]?.availability.unlocked,
          model: i[1],
        };
        items.push(v);
      }
    });
    return items;
  };

  const playSound = () => {
    const wavFile = require("../notification.mp3");
    const audio = new Audio(wavFile);
    var resp = audio.play();
    if (resp !== undefined) {
      resp
        .then((_) => {
          // autoplay starts!
        })
        .catch((error) => {
          console.info(error);
          //show error
        });
    }
  };

  const openWebsite = () => {
    window.open(
      "https://reserve-prime.apple.com/GB/en_GB/reserve/A/availability?&iUP=E&appleCare=Y&model=iPhone%2014%20Pro",
      "_blank"
    );
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          marginTop: 16,
          marginLeft: 16,
          fontSize: 20,
        }}
      >
        IPhone Checker by Riccardo Rizzo (https://www.riccardorizzo.eu)
      </div>

      {getItems().map((store, i) => {
        return (
          <div
            key={`store-${i}`}
            style={{
              display: "flex",
              marginTop: 30,
              border: "1px solid grey",
              padding: 16,
              marginLeft: 50,
              marginRight: 50,
              borderRadius: 4,
            }}
          >
            <div style={{ fontWeight: "bold" }}>{store.store}</div>
            <div
              onClick={() => openWebsite()}
              style={{
                fontWeight: store.contract === true ? "bold" : "normal",
                marginLeft: 16,
                color: store.contract === true ? "green" : "red",
                cursor: "pointer",
              }}
            >
              Contract: {store.contract === true ? "YES" : "No"}
            </div>
            <div
              onClick={() => openWebsite()}
              style={{
                fontWeight: store.unlocked === true ? "bold" : "normal",
                marginLeft: 16,
                color: store.unlocked === true ? "green" : "red",
                cursor: "pointer",
              }}
            >
              Unlocked: {store.unlocked === true ? "YES" : "No"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default IphoneChekerView;
