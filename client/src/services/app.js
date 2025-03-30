import axios from "../axiosConfig"
import axiosDefault from "axios"

export const apiGetPrices = () =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await axios({
        method: "get",
        url: "/api/v1/price/all",
      })
      resolve(response)
    } catch (error) {
      reject(error)
    }
  })
export const apiGetAreas = () =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await axios({
        method: "get",
        url: "/api/v1/area/all",
      })
      resolve(response)
    } catch (error) {
      reject(error)
    }
  })
export const apiGetProvinces = () =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await axios({
        method: "get",
        url: "/api/v1/province/all",
      })
      resolve(response)
    } catch (error) {
      reject(error)
    }
  })
export const apiGetPublicProvinces = () =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await axiosDefault({
        method: "get",
        url: "https://vapi.vnappmob.com/api/province/",
      })
      resolve(response)
    } catch (error) {
      reject(error)
    }
  })
export const apiGetPublicDistrict = (provinceId) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await axiosDefault({
        method: "get",
        url: `https://vapi.vnappmob.com/api/province/district/${provinceId}`,
      })
      resolve(response)
    } catch (error) {
      reject(error)
    }
  })
export const apiGetDistrictsByProvinceId = (id) =>
  axios({
    method: "get",
    url: "https://vietnam-administrative-division-json-server-swart.vercel.app/district/?idProvince=" + id,
  })
export const apiGetWardsByDistrictId = (id) =>
  axios({
    method: "get",
    url: "https://vietnam-administrative-division-json-server-swart.vercel.app/commune/?idDistrict=" + id,
  })
export const apiGetLocationsFromSearchTerm = (searchTerm) =>
  axios({
    method: "get",
    url: "https://nominatim.openstreetmap.org/search?format=json&q=" + searchTerm,
  })
