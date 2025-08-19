import React from "react";
import { FaCalendarDay, FaDollarSign } from "react-icons/fa";
import { HiMiniUsers } from "react-icons/hi2";
import { MdArrowUpward, MdOutlineHome } from "react-icons/md";
import { PiHouseLine } from "react-icons/pi";
import { Bar } from "react-chartjs-2";
import LineChart from "./LineChart";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import OrderTable from "../../components/home/OrderTable";
import { useGetStatisticsQuery } from "../../redux/apiSlices/homeSlice";
import Spinner from "../../components/common/Spinner";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Home = () => {

  const { data, isLoading } = useGetStatisticsQuery()
  console.log(data)


    if (isLoading) {
      return (
        <div className="flex items-center justify-center ">
         <Spinner />
        </div>
      );
    }

  return (
    <div className="">
      <div className="flex gap-10   rounded-lg">
        {/* Line Chart Section */}
        <div className=" flex-1 w-2/3 border border-[#DE5555]  rounded-lg p-6 ">
          <h2 className=" text-2xl font-bold text-black mb-4">Total Revenue</h2>
          <LineChart />
        </div>
        {/* Card Section */}
        <div className=" w-1/3  h-[340px] bg-gradient-to-r from-primary  to-secondary p-6 rounded-lg">
          <div className="flex justify-between mb-4 text-white">
            <h2 className=" mt-4"> Statistics</h2>
            <p className=" border-2  py-2 px-4 rounded-lg">Last 7 Days</p>
          </div>

          <div className="grid grid-cols-2 gap-3 h-[240px]">
            <div className="bg-white rounded-lg py-0 px-2 flex items-center justify-center gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-center  font-bold mb-3">Total Corals Sell</h2>
                  <h3 className="text-primary text-3xl text-center font-bold">
                     {data?.orders?.totalQuantity}
                  </h3>
                </div>
                
              </div>
            </div>

            <div className="bg-white rounded-lg py-0 px-2 flex items-center justify-center gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-center  font-bold mb-3">Total Users</h2>
                  <h3 className="text-primary text-3xl text-center font-bold">
                    {data?.users?.total}{" "}
                  </h3>
                </div>
                
              </div>
            </div>

            <div className="bg-white rounded-lg py-0 px-2 flex items-center justify-center gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-center  font-bold mb-3">Total Earn </h2>
                  <h3 className="text-primary text-3xl text-center font-bold">
                    {" "}
                    AED {data?.revenue.total}{" "}
                  </h3>
                </div>
                
              </div>
            </div>

            <div className="bg-white rounded-lg py-0 px-2 flex items-center justify-center gap-4">
              <div className="flex items-center  gap-3">
                <div>
                  <h2 className="text-center  font-bold mb-3">
                    Totals Orders Running
                  </h2>
                  <h3 className="text-primary text-3xl text-center  font-bold">
                    {data?.orders?.processing}{" "}
                  </h3>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className=" mt-16">
        <OrderTable />
        {/* <SalesLeaderBoard /> */}
      </div>
    </div>
  );
};

export default Home;
